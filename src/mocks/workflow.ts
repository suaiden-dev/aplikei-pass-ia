import { getServiceBySlug, servicesData } from "../data/services";
import type { UserService } from "../models/process.model";
import { mockAuthUsersSeed } from "./auth-users";
import { readUserServices, writeUserServices } from "./customer-portal";
import type {
  FileRef,
  ProductStep,
  ReviewAction,
  StepReview,
  UserProductInstance,
  UserStep,
} from "../services/workflow.service";

interface WorkflowProduct {
  id: string;
  slug: string;
  title: string;
}

const INSTANCES_STORAGE_KEY = "aplikei.workflow.instances";
const STEPS_STORAGE_KEY = "aplikei.workflow.steps";
const REVIEWS_STORAGE_KEY = "aplikei.workflow.reviews";
const DEMO_RESET_KEY = "aplikei.workflow.demo-reset";
const DEMO_RESET_VERSION = "2026-04-28-demo-customer-reset-v2";

const customerDemo = mockAuthUsersSeed.find((user) => user.email === "customer@aplikei.com");

function ensure<T>(key: string, seed: () => T): T {
  if (typeof window === "undefined") {
    return seed();
  }

  const stored = window.localStorage.getItem(key);
  if (!stored) {
    const initial = seed();
    window.localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(stored) as T;
  } catch {
    const initial = seed();
    window.localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

function listWorkflowProducts(): WorkflowProduct[] {
  return servicesData
    .filter((service) => service.steps.length > 0)
    .map((service) => ({
      id: `product-${service.slug}`,
      slug: service.slug,
      title: service.title,
    }));
}

function listWorkflowProductSteps(): ProductStep[] {
  return listWorkflowProducts().flatMap((product) => {
    const service = getServiceBySlug(product.slug);
    if (!service) {
      return [];
    }

    return service.steps.map((step, index) => ({
      id: `product-step-${product.slug}-${index + 1}`,
      product_id: product.id,
      title: step.title,
      description: step.description ?? null,
      order: index + 1,
      type: step.type === "review" ? "review" : step.type,
      is_required: true,
      config: {},
    }));
  });
}

function getProductById(productId: string) {
  return listWorkflowProducts().find((product) => product.id === productId) ?? null;
}

function getProductBySlug(slug: string) {
  return listWorkflowProducts().find((product) => product.slug === slug) ?? null;
}

function getProductStepsForProduct(productId: string) {
  return listWorkflowProductSteps()
    .filter((step) => step.product_id === productId)
    .sort((left, right) => left.order - right.order);
}

function maybeResetDemoCustomerWorkflowData() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.localStorage.getItem(DEMO_RESET_KEY) === DEMO_RESET_VERSION) {
    return;
  }

  const customerId = customerDemo?.id;
  if (!customerId) {
    window.localStorage.setItem(DEMO_RESET_KEY, DEMO_RESET_VERSION);
    return;
  }

  const instances = ensure<UserProductInstance[]>(INSTANCES_STORAGE_KEY, () => []);
  const removedInstanceIds = new Set(
    instances.filter((instance) => instance.user_id === customerId).map((instance) => instance.id),
  );

  if (removedInstanceIds.size > 0) {
    writeStorage(
      INSTANCES_STORAGE_KEY,
      instances.filter((instance) => !removedInstanceIds.has(instance.id)),
    );

    writeStorage(
      STEPS_STORAGE_KEY,
      ensure<UserStep[]>(STEPS_STORAGE_KEY, () => []).filter((step) => !removedInstanceIds.has(step.user_product_id)),
    );

    writeStorage(
      REVIEWS_STORAGE_KEY,
      ensure<StepReview[]>(REVIEWS_STORAGE_KEY, () => []).filter((review) => {
        const steps = ensure<UserStep[]>(STEPS_STORAGE_KEY, () => []);
        return !steps.some((step) => step.id === review.user_step_id && removedInstanceIds.has(step.user_product_id));
      }),
    );
  }

  window.localStorage.setItem(DEMO_RESET_KEY, DEMO_RESET_VERSION);
}

function readInstances() {
  maybeResetDemoCustomerWorkflowData();
  return ensure<UserProductInstance[]>(INSTANCES_STORAGE_KEY, () => []);
}

function readSteps() {
  maybeResetDemoCustomerWorkflowData();
  return ensure<UserStep[]>(STEPS_STORAGE_KEY, () => []);
}

function readReviews() {
  maybeResetDemoCustomerWorkflowData();
  return ensure<StepReview[]>(REVIEWS_STORAGE_KEY, () => []);
}

function writeInstances(instances: UserProductInstance[]) {
  writeStorage(INSTANCES_STORAGE_KEY, instances);
}

function writeSteps(steps: UserStep[]) {
  writeStorage(STEPS_STORAGE_KEY, steps);
}

function writeReviews(reviews: StepReview[]) {
  writeStorage(REVIEWS_STORAGE_KEY, reviews);
}

function toUserStep(productStep: ProductStep, instanceId: string): UserStep {
  const timestamp = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    user_product_id: instanceId,
    product_step_id: productStep.id,
    status: "pending",
    data: {},
    files: [],
    submitted_at: null,
    reviewed_at: null,
    created_at: timestamp,
    updated_at: timestamp,
    product_step: productStep,
  };
}

function deriveInstanceStatus(instanceId: string): UserProductInstance["status"] {
  const steps = readSteps().filter((step) => step.user_product_id === instanceId);

  if (steps.some((step) => step.status === "revision_requested")) {
    return "revision_requested";
  }

  if (steps.length > 0 && steps.every((step) => ["approved", "skipped"].includes(step.status))) {
    return "approved";
  }

  return "in_progress";
}

function deriveLegacyCurrentStep(steps: UserStep[]) {
  const nextActionable = steps.findIndex((step) => !["approved", "skipped", "completed", "in_review"].includes(step.status));
  return nextActionable === -1 ? Math.max(0, steps.length - 1) : nextActionable;
}

function deriveLegacyStatus(instance: UserProductInstance, steps: UserStep[]): UserService["status"] {
  if (instance.status === "approved") {
    return "completed";
  }

  if (steps.some((step) => step.status === "revision_requested")) {
    return "active";
  }

  if (steps.some((step) => step.status === "in_review")) {
    return "awaiting_review";
  }

  return "active";
}

function syncLegacyUserService(instanceId: string) {
  const instance = readInstances().find((entry) => entry.id === instanceId);
  if (!instance) {
    return;
  }

  const product = getProductById(instance.product_id);
  if (!product) {
    return;
  }

  const steps = listUserSteps(instanceId);
  const mergedStepData = steps.reduce<Record<string, unknown>>((acc, step) => {
    if (step.data && Object.keys(step.data).length > 0) {
      Object.assign(acc, step.data);
    }
    if (step.files && step.files.length > 0) {
      const docs = (acc.docs as Record<string, string>) ?? {};
      step.files.forEach((file) => {
        docs[file.name] = file.path;
      });
      acc.docs = docs;
    }
    return acc;
  }, {});

  const existingServices = readUserServices();
  const nextService: UserService = {
    id: instance.id,
    user_id: instance.user_id,
    service_slug: product.slug,
    status: deriveLegacyStatus(instance, steps),
    current_step: deriveLegacyCurrentStep(steps),
    step_data: mergedStepData,
    created_at: instance.created_at,
    updated_at: instance.updated_at,
  };

  const existingIndex = existingServices.findIndex((service) => service.id === instance.id);
  if (existingIndex >= 0) {
    const updatedServices = [...existingServices];
    updatedServices[existingIndex] = nextService;
    writeUserServices(updatedServices);
    return;
  }

  writeUserServices([nextService, ...existingServices]);
}

function updateInstance(instanceId: string, updater: (instance: UserProductInstance) => UserProductInstance) {
  const instances = readInstances();
  const index = instances.findIndex((instance) => instance.id === instanceId);

  if (index === -1) {
    throw new Error("Instância não encontrada");
  }

  const nextInstance = updater(instances[index]);
  const nextInstances = [...instances];
  nextInstances[index] = nextInstance;
  writeInstances(nextInstances);
  syncLegacyUserService(instanceId);
  return nextInstance;
}

function updateStep(userStepId: string, updater: (step: UserStep) => UserStep) {
  const steps = readSteps();
  const index = steps.findIndex((step) => step.id === userStepId);

  if (index === -1) {
    throw new Error("Step não encontrado");
  }

  const nextStep = updater(steps[index]);
  const nextSteps = [...steps];
  nextSteps[index] = nextStep;
  writeSteps(nextSteps);

  const nextStatus = deriveInstanceStatus(nextStep.user_product_id);
  updateInstance(nextStep.user_product_id, (instance) => ({
    ...instance,
    status: nextStatus,
    completed_at: nextStatus === "approved" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }));

  return nextStep;
}

export function getMockWorkflowProductIdBySlug(slug: string) {
  return getProductBySlug(slug)?.id ?? null;
}

export function getMockWorkflowProductStepsBySlug(slug: string) {
  const product = getProductBySlug(slug);
  if (!product) {
    return [];
  }

  return getProductStepsForProduct(product.id);
}

export function getOrCreateMockWorkflowInstance(userId: string, productId: string, orderId?: string): UserProductInstance {
  const existing = readInstances()
    .filter((instance) => instance.user_id === userId && instance.product_id === productId && !["canceled", "rejected"].includes(instance.status))
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())[0];

  if (existing) {
    syncLegacyUserService(existing.id);
    return existing;
  }

  const timestamp = new Date().toISOString();
  const instance: UserProductInstance = {
    id: crypto.randomUUID(),
    user_id: userId,
    product_id: productId,
    order_id: orderId ?? null,
    status: "in_progress",
    metadata: {},
    started_at: timestamp,
    completed_at: null,
    created_at: timestamp,
    updated_at: timestamp,
  };

  const steps = getProductStepsForProduct(productId).map((productStep) => toUserStep(productStep, instance.id));
  writeInstances([instance, ...readInstances()]);
  writeSteps([...readSteps(), ...steps]);
  syncLegacyUserService(instance.id);
  return instance;
}

export function listMockWorkflowInstances(userId: string) {
  return readInstances()
    .filter((instance) => instance.user_id === userId)
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime());
}

export function listUserSteps(instanceId: string): UserStep[] {
  const productSteps = listWorkflowProductSteps();

  return readSteps()
    .filter((step) => step.user_product_id === instanceId)
    .map((step) => ({
      ...step,
      product_step: productSteps.find((productStep) => productStep.id === step.product_step_id),
    }))
    .sort((left, right) => (left.product_step?.order ?? 0) - (right.product_step?.order ?? 0));
}

export function getMockWorkflowStep(instanceId: string, productStepId: string) {
  return listUserSteps(instanceId).find((step) => step.product_step_id === productStepId) ?? null;
}

export function saveMockWorkflowDraft(userStepId: string, data: Record<string, unknown>) {
  updateStep(userStepId, (step) => ({
    ...step,
    data,
    status: "in_progress",
    updated_at: new Date().toISOString(),
  }));
}

export function submitMockWorkflowStep(userStepId: string, data: Record<string, unknown>) {
  updateStep(userStepId, (step) => ({
    ...step,
    data,
    status: "in_review",
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

export function submitMockWorkflowFilesStep(userStepId: string, files: FileRef[]) {
  updateStep(userStepId, (step) => ({
    ...step,
    files,
    status: "in_review",
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

export function completeMockWorkflowStep(userStepId: string) {
  updateStep(userStepId, (step) => ({
    ...step,
    status: "completed",
    updated_at: new Date().toISOString(),
  }));
}

export function approveMockWorkflowStep(userStepId: string, adminId: string, comment?: string) {
  const step = updateStep(userStepId, (current) => ({
    ...current,
    status: "approved",
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const review: StepReview = {
    id: crypto.randomUUID(),
    user_step_id: userStepId,
    admin_id: adminId,
    action: "approved",
    comment: comment ?? null,
    created_at: new Date().toISOString(),
  };

  writeReviews([...readReviews(), review]);
  syncLegacyUserService(step.user_product_id);
}

export function requestMockWorkflowRevision(userStepId: string, adminId: string, comment: string) {
  const step = updateStep(userStepId, (current) => ({
    ...current,
    status: "revision_requested",
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const review: StepReview = {
    id: crypto.randomUUID(),
    user_step_id: userStepId,
    admin_id: adminId,
    action: "revision_requested",
    comment,
    created_at: new Date().toISOString(),
  };

  writeReviews([...readReviews(), review]);
  syncLegacyUserService(step.user_product_id);
}

export function listMockWorkflowReviews(userStepId: string) {
  return readReviews()
    .filter((review) => review.user_step_id === userStepId)
    .sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime());
}

export function appendMockWorkflowReview(userStepId: string, adminId: string, action: ReviewAction, comment?: string) {
  const review: StepReview = {
    id: crypto.randomUUID(),
    user_step_id: userStepId,
    admin_id: adminId,
    action,
    comment: comment ?? null,
    created_at: new Date().toISOString(),
  };

  writeReviews([...readReviews(), review]);
}

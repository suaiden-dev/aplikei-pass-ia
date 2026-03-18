import { CreateVisaOrderDTO, VisaOrder, UpdateVisaOrderDTO } from "@/domain/payment/PaymentEntities";

export interface IVisaOrderRepository {
  createOrder(orderData: CreateVisaOrderDTO): Promise<{ id: string } | null>;
  findLatestByProductAndUser(productSlug: string, userId: string, email: string): Promise<VisaOrder | null>;
  updateOrder(id: string, data: UpdateVisaOrderDTO): Promise<void>;
}

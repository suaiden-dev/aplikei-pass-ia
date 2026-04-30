export type I539Data = Record<string, unknown>;

export async function fillI539Form(data: I539Data) {
  const content = JSON.stringify(data, null, 2);
  return new TextEncoder().encode(content);
}

export async function uploadFilledI539(bytes: Uint8Array, processId: string, userId: string) {
  void processId;
  void userId;
  return URL.createObjectURL(new Blob([Uint8Array.from(bytes)], { type: "application/pdf" }));
}

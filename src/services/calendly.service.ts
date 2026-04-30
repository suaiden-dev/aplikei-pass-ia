export const calendlyService = {
  getUrl() {
    return "https://calendly.com/aplikei/demo";
  },
  async findEventByName(_name: string) {
    return {
      scheduling_url: "https://calendly.com/aplikei/demo",
    };
  },
};

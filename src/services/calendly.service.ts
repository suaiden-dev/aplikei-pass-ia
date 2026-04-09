const CALENDLY_ACCESS_TOKEN = import.meta.env.VITE_CALENDLY_ACCESS_TOKEN;
const CALENDLY_API_URL = "https://api.calendly.com";

export interface CalendlyEventType {
  name: string;
  scheduling_url: string;
  active: boolean;
  slug: string;
}

export const calendlyService = {
  async getEventTypes(): Promise<CalendlyEventType[]> {
    if (!CALENDLY_ACCESS_TOKEN) {
      console.warn("CALENDLY_ACCESS_TOKEN not found in environment.");
      return [];
    }

    try {
      // 1. Get current user to find organization
      const userResponse = await fetch(`${CALENDLY_API_URL}/users/me`, {
        headers: {
          "Authorization": `Bearer ${CALENDLY_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      });

      if (!userResponse.ok) throw new Error("Failed to fetch Calendly user");
      const { resource: userResource } = await userResponse.json();
      
      // 2. Get event types for that organization/user
      const eventsResponse = await fetch(`${CALENDLY_API_URL}/event_types?organization=${userResource.current_organization}`, {
        headers: {
          "Authorization": `Bearer ${CALENDLY_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      });

      if (!eventsResponse.ok) throw new Error("Failed to fetch Calendly event types");
      const { collection } = await eventsResponse.json();

      return collection.map((item: any) => ({
        name: item.name,
        scheduling_url: item.scheduling_url,
        active: item.active,
        slug: item.slug
      })) as CalendlyEventType[];
    } catch (err) {
      console.error("[CalendlyService] Error:", err);
      return [];
    }
  },

  async findEventByName(name: string): Promise<CalendlyEventType | null> {
    const events = await this.getEventTypes();
    return events.find(e => e.name.toLowerCase().includes(name.toLowerCase()) && e.active) || null;
  }
};

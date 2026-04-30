

export interface CoverLetterData {
  reasonGoUS?: string;
  locationsVisited?: string;
  reasonB1B2?: string;
  jobInBrazil?: string;
  reasonNotF1Directly?: string;
  reasonStatusChange?: string;
  careerBenefit?: string;
  specificCourse?: string;
  whyNotBrazil?: string;
  residenceInBrazil?: string;
  financialSupport?: string;
  sponsorInfo?: string;
}

export const coverLetterService = {
  generateHTML(data: CoverLetterData, user: { fullName?: string; address?: string }): string {
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const fullName = user.fullName || "Applicant Name";
    const address = user.address || "Applicant Address";

    return `
      <div style="font-family: 'Times New Roman', Times, serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: auto;">
        <div style="text-align: right; margin-bottom: 40px;">
          <p><strong>${fullName}</strong></p>
          <p>${address}</p>
          <p>${today}</p>
        </div>

        <div style="margin-bottom: 40px;">
          <p><strong>U.S. Citizenship and Immigration Services</strong></p>
          <p>ATTN: I-539</p>
          <p>2501 S. State Highway 121 Business</p>
          <p>Suite 400</p>
          <p>Lewisville, TX 75067</p>
        </div>

        <div style="margin-bottom: 30px;">
          <p><strong>RE: Application to Change Nonimmigrant Status from B-1/B-2 to F-1</strong></p>
          <p><strong>Applicant: ${fullName}</strong></p>
        </div>

        <p>Dear Immigration Officer,</p>

        <p>I am writing to respectfully request a change of my nonimmigrant status from B-1/B-2 (Temporary Visitor) to F-1 (Academic Student). I entered the United States on a B-1/B-2 visa for the purpose of ${data.reasonGoUS || "[Primary Purpose]"}, and since my arrival, I have visited ${data.locationsVisited || "[Locations]"}.</p>

        <p><strong>Reason for Change of Status</strong></p>
        <p>${data.reasonStatusChange || "During my stay, I realized that enhancing my education in the United States would be a pivotal step for my career."} ${data.reasonNotF1Directly || "I did not apply for an F-1 visa directly in my home country because my initial intent was purely temporary visitation, and the decision to study was made after experiencing the academic environment here."}</p>

        <p><strong>Study Plan and Career Goals</strong></p>
        <p>I have been accepted into the ${data.specificCourse || "[Course Name]"} program. ${data.whyNotBrazil || "This specific specialized training is not readily available with the same quality and technological environment in Brazil."} This course will significantly benefit my career by ${data.careerBenefit || "[Career Benefits]"} upon my return.</p>

        <p><strong>Financial Support and Maintenance of Status</strong></p>
        <p>${data.financialSupport || "I have sufficient funds to cover my tuition and living expenses during my studies."} ${data.sponsorInfo || "I am being supported by [Sponsor Name] who is [Relationship]."}</p>

        <p><strong>Ties to Home Country and Intent to Return</strong></p>
        <p>I maintain strong ties to Brazil, where I have ${data.jobInBrazil || "my employment and professional network"}. My residence in Brazil is being ${data.residenceInBrazil || "maintained and waiting for my return"}. I fully intend to return to Brazil upon completion of my studies to apply the knowledge gained.</p>

        <p>Thank you for your time and consideration of my application.</p>

        <div style="margin-top: 50px;">
          <p>Sincerely,</p>
          <br/><br/>
          <p>__________________________</p>
          <p><strong>${fullName}</strong></p>
        </div>
      </div>
    `;
  }
};

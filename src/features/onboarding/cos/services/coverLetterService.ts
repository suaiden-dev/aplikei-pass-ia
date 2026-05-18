export const coverLetterService = {
  generateHTML(data: object, user?: { fullName?: string; full_name?: string }) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h1>Cover Letter</h1>
          <p><strong>Applicant:</strong> ${user?.fullName ?? user?.full_name ?? "Aplikei Customer"}</p>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </body>
      </html>
    `;
  },
};

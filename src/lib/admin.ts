export const ADMIN_EMAILS = [
    "info@thefutureofenglish.com",
    "admin@suaiden.com",
    "suaiden@suaiden.com",
    "fernanda@suaiden.com",
    "victuribdev@gmail.com",
    "newvicturibdev@gmail.com",
    "dev01@suaiden.com",
];

export const checkIsAdmin = (email?: string | null) => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
};

export const guestIdGenerator = () => {
    const prefix = "LJ";

    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const dateStr = `${day}${month}${year}`;

    const randomStr = Array.from({ length: 6 }, () =>
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join("");

    return `${prefix}-${dateStr}-${randomStr}`;
};

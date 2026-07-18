// The account that always has owner ("master control") access, regardless of
// what role is stored in the database. Lets a fresh account promote itself
// on first login without a manual DB edit.
export const OWNER_EMAIL = process.env.OWNER_EMAIL ?? "ekundaniel101@gmail.com";

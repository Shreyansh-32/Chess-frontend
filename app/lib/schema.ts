import z from "zod";

export const userSchema = z.object({
    email : z.string().min(3 , {"message" : "Minimum length 3"}),
    password : z.string().min(8 , {"message" : "Minimum length 8"}).max(20, { message: 'Maximum length 20' })
    .refine((password) => /[A-Z]/.test(password), {
      message: 'Must contain one uppercase alphabet',
    })
    .refine((password) => /[a-z]/.test(password), {
      message: 'Must contain one lowercase alphabet',
    })
    .refine((password) => /[0-9]/.test(password), { message: 'Must contain one digit' })
    .refine((password) => /[!@#$%^&*]/.test(password), {
      message: 'Must contain one specail character',
    })
});

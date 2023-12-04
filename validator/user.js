import { body } from "express-validator";
export const user_validator = [
    body('name').isLength({min:2}),
    body('email').isEmail(),
    body('password').isLength({min:5})
]
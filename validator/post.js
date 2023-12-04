import { body } from "express-validator";

export const post_validator = [
    body('title').isLength({min:2}),
    body('description').isLength({min:5}),
    body('img').isLength({min:5}),
    body('price').isLength({min:1})
]
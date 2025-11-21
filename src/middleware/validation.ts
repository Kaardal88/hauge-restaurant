/* import { Request, Response, NextFunction } from "express";



export function validateUserId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  next();
}

export function validateRequiredUserData =(
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = requriedUserDataSchema.safeParse(req.body);

  if(!result.success){
    return res.status(400).json({error:"Validation failed", details: result.error.issues.map((issue) => issue.message),});
  }
  next();
};



export function validatePartialUserData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username, email } = req.body;

  if (!username && !email) {
    return res
      .status(400)
      .json({ message: "At least one of username or email is required" });
  }
  next();
}
 */

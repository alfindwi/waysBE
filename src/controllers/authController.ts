import { Request, Response } from "express";
import { LoginDto, RegisterDto } from "../dto/authDto";
import * as authService from "../services/authService";

export const login = async (req: Request, res: Response) => {
  try {
    const dataLogin = req.body as LoginDto;

    const token = await authService.login(dataLogin);
    res.json(token);
  } catch (error) {
    console.log(error);

    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const data = req.body as RegisterDto;

    const user = await authService.register(data);

    res.json({ user });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

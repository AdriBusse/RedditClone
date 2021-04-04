import { validate, isEmpty } from 'class-validator';
import { Request, Response } from 'express';
import { Controller } from 'tsoa';
import User from '../../entities/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default class AuthController extends Controller {
  mapErrors = (errors: Object[]) => {
    return errors.reduce((prev: any, err: any) => {
      prev[err.property] = Object.entries(err.constraints)[0][1];
      return prev;
    }, {});
  };
  register = async (req: Request, res: Response) => {
    const { email, username, password } = req.body;

    try {
      let errors: any = {};
      const existingEmail = await User.findOne({ email });
      const existingUsername = await User.findOne({ username });

      if (existingEmail) errors.email = 'Email already in Use';
      if (existingUsername) errors.username = 'Username already in Use';

      if (Object.keys(errors).length > 0) {
        return res.status(400).json(errors);
      }

      const user = new User({ email, username, password });

      errors = await validate(user);

      if (errors.length > 0)
        return res.status(400).json(this.mapErrors(errors));
      await user.save();

      return res.json(user);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  };
  login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
      let errors: any = {};
      if (isEmpty(username)) errors.username = 'Username should not be empty';
      if (isEmpty(password)) errors.password = 'Password should not be empty';
      if (Object.keys(errors).length > 0) {
        console.log(errors);

        return res.status(400).json(errors);
      }

      const user = await User.findOne({ username });

      if (!user) return res.status(404).json({ username: 'User not found' });

      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches)
        return res.status(401).json({ password: 'Wrong Credentials' });

      const token = jwt.sign({ username }, process.env.JWT_SECRET!);

      res.set(
        'Set-Cookie',
        cookie.serialize('token', token, {
          httpOnly: true, //Cookie cannot be accessed by JS
          secure: false, // with true Cookie will just send over HTTPS. In Dev we dont have it
          sameSite: 'strict',
          maxAge: 3600,
          path: '/',
        })
      );
      return res.json(user);
    } catch (err) {
      return res.json(err);
    }
  };

  me = async (req: Request, res: Response) => {
    return res.json(res.locals.user);
  };

  logout = (req: Request, res: Response) => {
    res.set(
      'Set-Cookie',
      cookie.serialize('token', '', {
        httpOnly: true, //Cookie cannot be accessed by JS
        secure: false, // with true Cookie will just send over HTTPS. In Dev we dont have it
        sameSite: 'strict',
        expires: new Date(0),
        path: '/',
      })
    );
    return res.status(200).json({ success: true });
  };
}

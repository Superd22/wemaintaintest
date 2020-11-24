import express, { Request, Response  } from 'express';
import bodyParser from 'body-parser';
import expressValidator, { body, oneOf, validationResult } from 'express-validator';

const app = express();
const port = 4000;

app.use(bodyParser.json())
app.post( "/search", 
  oneOf([
    [
      body('latitude').exists().isFloat(),
      body('longitude').exists().isFloat(),
      body('radius').exists().isInt(),
    ],
    body('bandIds').exists().isString().custom(value => {
      const bandIds = value.split(',');
  
      bandIds.forEach((id: string) => {
        if (Math.sign(parseInt(id)) !== 1) {
          return false
        }
      })
  
      return true;
   }).withMessage('bandIds should be a string of ids')
  ]), ( req: Request, res: Response ) => {
    const body = req.body;

    res.send( "Hello world!" );
});

// start the Express server
app.listen( port, () => {
  console.log( `server started at http://localhost:${ port }` );
});
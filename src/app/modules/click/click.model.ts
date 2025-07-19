import { Schema, model, Document } from 'mongoose';

export interface IClickModel extends Document {
  name: string;
  // add more fields here
}

const clickSchema = new Schema<IClickModel>({
  name: { type: String, required: true },
  // add more fields here
});

const clickModel = model<IClickModel>('Click', clickSchema);

export default clickModel;

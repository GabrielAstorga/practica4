import { ObjectId } from "mongodb";



export type User = {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

export type Project ={
  _id?: ObjectId;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  owner: ObjectId;
  members: ObjectId[];
  taskLibrary:string[]
}

export type Task ={
  _id?: ObjectId;
  title: string;
  projectId: ObjectId;
  assignedTo?: ObjectId;
  status: String;
  priority: String;
  dueDate: String;
}

export type AuthPayLoad ={
    userid:string
}
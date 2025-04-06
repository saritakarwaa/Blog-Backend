import mongoose, { Schema, Document, Model } from "mongoose";

// Reaction Type
type Reaction = {
  likes: number;
  funny: number;
  insightful: number;
};

// Blog Type
type Blog = {
  blogId: string;
  blogTitle: string;
  content: string;
  image?: string;
  video?: string;
  reaction: Reaction[] | [];
};

// User Interface
export interface IUser extends Document {
  id: string;
  email: string;
  password: string;
  blogs: Blog[];
  profilePicture: string;
}

const reactionSchema: Schema<Reaction> = new Schema({
  likes: {
    type: Number,
    default: 0,
  },
  funny: {
    type: Number,
    default: 0,
  },
  insightful: {
    type: Number,
    default: 0,
  },
});

const blogSchema: Schema<Blog> = new Schema({
  blogId: {
    type: String,
    required: true,
  },
  blogTitle: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  video: {
    type: String,
  },
  reaction: {
    type: [reactionSchema],
    default: [],
  },
});

const userSchema: Schema<IUser> = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    blogs: {
      type: [blogSchema],
      default: [],
    },
    profilePicture:{
      type:String,
      default:"",
    }
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;

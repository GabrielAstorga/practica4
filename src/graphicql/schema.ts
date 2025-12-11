import { gql} from "apollo-server";

export const typeDefs = gql`

type user{
    _id:ID!
    email:String
}
 type Users {
    _id: ID!
    username: String!
    email: String!
    password: String!
    createdAt: String!
}

 type Projects {
    _id: ID!
    name: String!
    description: String!
    startDate: String!
    endDate: String!
    owner: ID!
    members: [ID]
    tasksLibrary:[Tasks]
}

 type Tasks {
    _id: ID!
    title: String!
    projectId: ID!
    assignedTo:ID
    status: String!
    priority: String!
    dueDate:String!
}

type AuthPayLoad {
    userId:String
}

input RegisterInput {
    username: String!
    email: String!
    password: String!
}

input LoginInput {
    email: String!
    password: String!
}

input CreateProjectInput{
    name:String!
    description:String!
    startDate: String!
    endDate: String!
    
}


input TaskInput{
  title: String!
  assignedTo: ID
  priority: String!
  dueDate: String
}

input UpdateProjectInput{
    name:String
    description:String
    startDate:String
    endDate:String
}


type Query {
    me: user
    myProjects:[Projects!]!
    projectDetails(projectId:ID!): Projects
    users:[Users!]!
}

type Mutation{
    register(input:RegisterInput!):AuthPayLoad!
    login(input:LoginInput!):AuthPayLoad

    createProject(input:CreateProjectInput!):Projects!
    updateProject(projectId: ID!,input: UpdateProjectInput!):Projects!
    addMember(projectId: ID!,userId:ID!):Projects!
    createTask(projectId:ID!,input:TaskInput!):Projects!
    updateTaskStatus(taskId: ID!, status:String!):Tasks!
    deleteProject(id:ID!):String!
}





`
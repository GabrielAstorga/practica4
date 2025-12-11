import { ObjectId } from "mongodb";
import { getDB } from "../db/mongodb"
import { IResolvers } from "@graphql-tools/utils";
import { signToken } from "../autentificacion/auth";
import { Project,Task,User } from "../types/types";
import bcrypt from "bcryptjs"


const coleccionProyecto = ()=>getDB().collection<Project>("proyectos")
const coleccionUsuario = ()=>getDB().collection<User>("UsuariosProyectos")
const coleccionTarea= ()=> getDB().collection<Task>("Tareas")

export const resolvers: IResolvers = {
    Query:{
        me: async(_,__,{user}) =>{
            if(!user) return null;
            return {
                _id: user._id.toString(),
                email: user.email,
            }
        },

        myProjects: async(_,__,{user}) =>{
            if(!user) return null;
            const userid= new ObjectId(user._id);
            return await coleccionProyecto().find({ 
                $or: [{ owner: userid }, { members: userid }] }).toArray();
            
        },
        projectDetails: async(_,{projectId})=>{
            const result= await coleccionProyecto().findOne({_id: new ObjectId(projectId)})
            return result;
        },
        users: async () => {
            return await coleccionUsuario().find().toArray();
        }
    },
    Projects: {
  tasksLibrary: async (parent: Project) => {
    const listaTareas = parent.taskLibrary || [];
    
    
    const objetosIdTask = listaTareas.map((id) => new ObjectId(id));
    
    return coleccionTarea().find({ _id: { $in: objetosIdTask } }).toArray();
  }
},


    Mutation:{
        register: async(_,{input}) =>{
            const { username, email, password } = input;
            const existename= await coleccionUsuario().findOne({username})
            if(existename) return null;
            const existeemail= await coleccionUsuario().findOne({email})
            if(existeemail)return null;

            const contraencriptada = await bcrypt.hash(password,10);
            const result =await coleccionUsuario().insertOne({
                username,
                email,
                password : contraencriptada,
                createdAt: new Date()
            })

            return {userId: signToken( result.insertedId.toString())}
        },
        login: async (_,{input})=>{
            const { email, password } = input;
            const user= await coleccionUsuario().findOne({email})
            if(!user)return null;

            const comprobar = await bcrypt.compare(password, user.password)
            if(!comprobar) return null;

            return {userId: signToken( user._id.toString())} 



        },
        createProject: async(__,{input},{user})=> {
            if(!user)return null;
            const {name,description,startDate,endDate}=input;
            const result=await coleccionProyecto().insertOne({
                name,
                description,
                startDate,
                endDate,
                taskLibrary:[],
                owner:user._id,
                members:[]
                
            })
            return await coleccionProyecto().findOne({_id:result.insertedId})
        },
        updateProject: async (_,{projectId,input},{user}) => {
            if(!user)return null;
            const {name,description,startDate,endDate}=input

            const project = await coleccionProyecto().findOne({ _id: new ObjectId(projectId) });
            
            if(!project)return null;
            if(project.owner?.toString()!== user._id.toString())return null;
            
            const result= await coleccionProyecto().updateOne({_id:new ObjectId(projectId)},
        {$set: {name,description,startDate,endDate}})
        
        return coleccionProyecto().findOne({_id:new ObjectId(projectId)});


        },
        addMember:async (_,{projectId,userId},{user}) =>{
            if(!user)return null;
            const proyecto= await coleccionProyecto().findOne({_id:new ObjectId(projectId)})
            if(!proyecto)return null;

            if(proyecto.owner?.toString()!== user._id.toString())return null;

             await coleccionProyecto().updateOne(
                {_id: new ObjectId(projectId)},
                {$push:{members:userId}})

                return await coleccionProyecto().findOne({_id: new ObjectId(projectId)})




        },

        createTask: async (_,{projectId,input},{user}) =>{
            if(!user)return null;

            const proyecto = await coleccionProyecto().findOne({_id: new ObjectId(projectId)});
            if(!proyecto) return null;
            if(proyecto.owner?.toString() !== user._id.toString()) return null;
            const {title,assignedTo,priority,dueDate}=input
            const result= await coleccionTarea().insertOne({
                title,
                assignedTo,
                projectId:projectId,
                status:"PENDING",
                priority,
                dueDate
            })
            const idtarea= new ObjectId(result.insertedId)

            await coleccionProyecto().updateOne({_id:new ObjectId(projectId)},{
               $addToSet: { taskLibrary:  result.insertedId.toString()}
            })

            return coleccionProyecto().findOne({_id: new ObjectId(projectId)});

        },

        updateTaskStatus: async (_,{taskId,status},{user})=>{

            if(!user)return null;

            const tarea = await coleccionTarea().findOne({_id: new ObjectId(taskId)});
            if(!tarea) return null; 
            await coleccionTarea().updateOne({_id:new ObjectId(taskId)},{
               $set:{status:status}
            })

            return await coleccionTarea().findOne({_id: new ObjectId(taskId)});



        },
        deleteProject: async (_,{id},{user})=>{
            if(!user)return null;
            
            

            const proyecto = await coleccionProyecto().findOne({_id:new ObjectId(id)});
            if(!proyecto)return null;

            await coleccionTarea().deleteMany({projectId: id})
            
            await coleccionProyecto().deleteOne({_id:new ObjectId(id)});

            return "Se ha eliminado el proyecto y sus tareas"
        }
        
    }

}
           
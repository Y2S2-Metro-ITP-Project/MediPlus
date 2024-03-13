export const test=(req,res)=>{
    res.json({message:"API is working!!!!!"})
}

export const signout=(req,res,next)=>{
    try {
        res.clearCookie("token");
        res.json({message:"Signout success"})
    } catch (error) {
        next(error)
    }
}
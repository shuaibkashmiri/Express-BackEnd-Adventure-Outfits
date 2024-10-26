const User =require("../model/userModel")

const addDiliveryDetails=async (req,res)=>{
    try {
        const userId=req.user;
        const {mobile,fullname,street,landmark,village,city,state,pincode,}=req.body;
        const credentials={mobile,fullname,street,landmark,village,city,state,pincode,};

        const someEmpty = Object.values(credentials).some(value => !value);

        if(someEmpty){
            return res.status(206).json({message:"All credentails required"})
        }

        const user=await User.findByIdAndUpdate(userId,{mobile,fullname,street,landmark,village,city,state,pincode})

        if(user){
            res.status(200).json({message:"Delivery Details Updated"})
        }else{
            res.status(400)
        }
      
        
    } catch (error) {
        console.log(error)
    }
}

module.exports={addDiliveryDetails}
const { json } = require('body-parser');
const { update } = require('../models/postage.js');
const Postage = require ('../models/postage.js');
const UPS = require('../models/UPS.js');
const User = require('../models/user.js');

module.exports = {
    async create_common (req, res){
        try{
            if(req.file){
                console.log(req.file);
                req.body.post_midia = `${process.env.APP_HOST}/img/${req.file.filename}`;
            }

            const postage = await Postage.create(req.body);

            postage.post_support_number = 0
            postage.save()
            
            console.log(postage);
            return res.status(200).json({postage});
            
        }catch(err){
            return res.status(400).send({ error: err.message});
        }
    },

    async create_anon (req, res){
        try{
            if(req.file){
                console.log(req.file);
                req.body.post_midia = `${process.env.APP_HOST}/img/${req.file.filename}`;
            }

            req.body.fk_user_id = null;

            const postage = await Postage.create(req.body);
            
            postage.post_support_number = 0
            postage.save()

            console.log(postage);
            return res.status(200).json({postage});
            
        }catch(err){
            return res.status(400).send({ error: err.message});
        }
    },

    async list (req, res){
        const posts = await Postage.find();
        return res.json(posts);
    },

    async list_one (req, res){
        const posts = await Postage.findById(req.params.id);
        return res.json(posts);
    },

    async delete_one_for_test (req, res){
        const post = await Postage.findById(req.params.id);
        await post.remove();
        return res.send();
    },

    async delete_all (req, res){
        const post = await Postage.deleteMany({})
        return res.send(post);
    },

    async list_common (req, res){
        try{
            const posts = await Postage.find({ $where: "this.fk_user_id != null" }, { 
                post_category: 0, 
                post_description: 0,
                post_permission: 0
            });
            
            console.log(posts);
            return res.status(200).json({posts});
        }catch(err){
            return res.status(400).send({error: err.message});
        }
    },

    async update_status (req, res){
        try{
          	const post = await Postage.findByIdAndUpdate(req.params.id, req.body.post_status)          
		    return res.status(200).json({post});
        }catch(err){
            return res.status(400).send({error: err.message});
        }
    },

    async list_all_postages_with_UPS_by_user (req, res){ 

        try{
            const user = await User.findById(req.params.id)
            if(user == null){
                console.log("User not exist\n" + "++++\n")
                return res.status(400).send({error_UPS_list_for_user: "User not exist"});
            }
            
            const postages_list = await Postage.find();
            
            console.log("-----\n\n" + "LIST POSTAGES WITH UPSs:")
            console.log("\nListing all postages...\n")

            let array_UPSs = null
            for (var i = 0; i < postages_list.length; i++){

                    array_UPSs = await UPS.find({ 
                    fk_user_id: user._id,
                    fk_postage_id: postages_list[i]._id
                })
                
                postages_list[i].post_supporting = false
                
                if(array_UPSs.length != 0){
                    postages_list[i].post_supporting = true
                }

                console.log("Postage " + postages_list[i]._id + ": " + postages_list[i].post_supporting + "\n-----")
            }

            return res.json(postages_list);

        }catch(err){
            return res.status(400).send({error: err.message});        
        }
    },

    async update_postage (req, res){
        
        return res.status(200).json(req.body)
    },

    async delete_one (req, res){
        const post = await Postage.findById(req.params.id);
        await post.remove();
        return res.send();
    }
}
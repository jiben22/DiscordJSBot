const Discord = require('discord.js');
const client = new Discord.Client();
const db = require('./db');

module.exports = {
    log: function () {
        client.on('ready', () => {
            console.log(`Logged in as ${client.user.tag}!`);
        });

        let token = 'NTg1NzMzMjg3NzAwMzMyNTU0.XP-6RQ.ZHGGGv0Zk3Em_Vwh1jZSLU2Go8E';
        client.login(token);
    },

    message: function () {
        client.on('message', msg => {
            //It's command
            if ( msg.content.startsWith('/') ) {
                //Get names permission
                db.getNamesPermission()
                    .then( namesPermission => {
                        let namePermissionMsg = msg.content.substring(1).split(' ')[0].toUpperCase();

                        console.log(namePermissionMsg);

                        if ( namesPermission.some(item => item.name === namePermissionMsg) ) {
                            //Delete message
                            msg.delete();

                            //Check if the role of moderator can execute the command
                            db.moderatorCanExecutePermission(msg.guild.id, msg.author.id, msg.channel.id, namePermissionMsg )
                                .then( results => {

                                    //Moderator can execute the command
                                    if( results.length > 0) {
                                        switch (namePermissionMsg) {
                                            case "AVERTIR":
                                                break;
                                            case "BAN":
                                                ban(msg);
                                                break;
                                            case "EXCLURE":
                                                kick(msg);
                                                break;
                                            case "MUET":
                                                break;
                                            case "SOURD":
                                                break;
                                        }
                                    } else {
                                        return msg.channel.send("Vous n'avez pas la permission");
                                    }
                                });
                        }
                    })
            }
        });
    },

    checkMemberMentionned: function(msg) {
        let isMemberMentionned = true;

        //Check if the user is mentionned
        if(msg.mentions.users.size === 0) {
            msg.channel.send("Vous devez mentionner un utilisateur");
            isMemberMentionned = false;
        }

        //Check if member exist
        let memberMentionned = msg.guild.member(msg.mentions.users.first());
        if(!memberMentionned) {
            msg.channel.send("Le membre n'existe pas");
            isMemberMentionned = false;
        }

        return isMemberMentionned;
    },

    ban: function (msg) {
        if( checkMemberMentionned ) {
            let memberMentionned = msg.guild.member(msg.mentions.users.first());

            //Ban the member
            memberMentionned.ban()
                .then(member => {
                    let ban_embed = new Discord.RichEmbed()
                        .setColor("#a40a12")
                        .setTitle("BAN :")
                        .addField("Membre banni:", `${member.user.username}`)
                        .addField("ID :", `${member.user.id}`)
                        .addField("Modérateur :", `${msg.author.username}`);
                    client.guilds.get(msg.guild.id).channels.get(msg.channel.id).send(ban_embed);
                });
        }
    },

    kick: function (msg) {
        console.log("KICK");

        if( checkMemberMentionned ) {
            let memberMentionned = msg.guild.member(msg.mentions.users.first());
            let reason = "REASON";

            memberMentionned.kick(reason)
                .then(member => {
                    let ban_embed = new Discord.RichEmbed()
                        .setColor("#40A497")
                        .setTitle("EXCLURE :")
                        .addField("Membre exclu:", `${member.user.username}`)
                        .addField("Raison :", reason)
                        .addField("ID :", `${member.user.id}`)
                        .addField("Modérateur :", `${msg.author.username}`);
                    client.guilds.get(msg.guild.id).channels.get(msg.channel.id).send(ban_embed);
                });
        }
    }
};
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
            ///avertir @jiben22#1522 "Parce que" +30d

            //It's command
            if ( msg.content.match('^\\/') ) {
                //Get names permission
                db.getNamesPermission()
                    .then( namesPermission => {
                        let namePermissionMsg = msg.content.substring(1).split(' ')[0].toUpperCase();

                        if ( namesPermission.some(item => item.name === namePermissionMsg) ) {
                            //Delete message
                            msg.delete();

                            //Check if the role of moderator can execute the command
                            db.moderatorCanExecutePermission(msg.guild.id, msg.author.id, msg.channel.id, namePermissionMsg )
                                .then( results => {

                                    console.log(msg.content);

                                    //Get reason if exist and remove first and last "
                                    let reason = msg.content.match('".*"')[0].slice(1,-1);
                                    let duration = msg.content.match('\\+[0-9]*[smhdwMY]')[0].substring(1);

                                    //Get all attributes for Sanction
                                    let attributes = this.getAttributesForSanction(msg, msg.member.id, namePermissionMsg, reason, duration);

                                    //Moderator can execute the command
                                    if( results.length > 0) {
                                        switch (namePermissionMsg) {
                                            case "AVERTIR":
                                                this.avertir(msg, attributes);
                                                break;
                                            case "BAN":
                                                this.ban(msg, attributes);
                                                break;
                                            case "EXCLURE":
                                                this.exclure(msg, attributes);
                                                break;
                                            case "MUET":
                                                this.muet(msg, attributes);
                                                break;
                                            case "SOURD":
                                                this.sourd(msg, attributes);
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

    avertir: function(msg, attributes) {
        //Check if a member is mentionned
        if( this.checkMemberMentionned(msg) ) {
            let memberMentionned = msg.guild.member(msg.mentions.users.first());

            //Create sanction
            db.createSanction(attributes);

            //Warn the member
            let warn_embed = new Discord.RichEmbed()
                .setColor("#a46104")
                .setTitle("AVERTIR :")
                .addField("Membre averti:", `${memberMentionned.user.username}`);

            //Check if reason is not null
            let reason = attributes["reason"];
            if ( reason.length > 0 ) { warn_embed.addField("Raison :", reason); }

            //Check if duration is not null
            let duration = attributes["duration"];
            if ( duration.length > 0 ) { warn_embed.addField("Durée :", "?"); }

            warn_embed.addField("Guild :", `${client.guilds.get(msg.guild.id).name}`)
                .addField("Channel :", `${client.guilds.get(msg.guild.id).channels.get(msg.channel.id).name}`)
                .addField("Modérateur :", `${msg.author.username}`);

            //Send warn message in DM
            memberMentionned.send(warn_embed);
        }
    },

    ban: function (msg, attributes) {
        //Check if a member is mentionned
        if( this.checkMemberMentionned(msg) ) {
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

    exclure: function (msg) {
        //Check if a member is mentionned
        if( this.checkMemberMentionned(msg) ) {
            let memberMentionned = msg.guild.member(msg.mentions.users.first());
            let reason = "REASON";

            //Kick the member
            memberMentionned.kick(reason)
                .then(member => {
                    let kick_embed = new Discord.RichEmbed()
                        .setColor("#40A497")
                        .setTitle("EXCLURE :")
                        .addField("Membre exclu:", `${member.user.username}`)
                        .addField("Raison :", reason)
                        .addField("ID :", `${member.user.id}`)
                        .addField("Modérateur :", `${msg.author.username}`);
                    client.guilds.get(msg.guild.id).channels.get(msg.channel.id).send(kick_embed);
                });
        }
    },

    muet: function (msg, attributes) {
        //Check if a member is mentionned
        if( this.checkMemberMentionned(msg) ) {
            let memberMentionned = msg.guild.member(msg.mentions.users.first());

            //Mute the member
            memberMentionned.mute()
                .then(() => {
                    let muet_msg = memberMentionned + " vous êtes muet";

                    //Check if duration is not null
                    let duration = attributes["duration"];
                    if ( duration != null ) { muet_msg += " pendant " + duration; }

                    //Send message
                    msg.channel.send( muet_msg );
                })
        }
    },

    sourd: function (msg, attributes) {
        //Check if a member is mentionned
        if( this.checkMemberMentionned(msg) ) {
            let memberMentionned = msg.guild.member(msg.mentions.users.first());

            //Deaf
            memberMentionned.deaf()
                .then(() => {
                    msg.channel.send(memberMentionned + " vous êtes mis en sourdine pendant ?");
                });
        }
    },

    getAttributesForSanction: function (msg, idMember, namePermissionMsg, reason, duration) {
        let idModerator = msg.author.id;
        let idGuild = msg.guild.id;
        let idChannel = msg.channel.id;

        return {
            idModerator: idModerator,
            idGuild: idGuild,
            idChannel: idChannel,
            idMember: idMember,
            name: namePermissionMsg,
            reason: reason,
            duration: duration
        };
    }
};
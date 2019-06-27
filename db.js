const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'botDiscord',
    password: 'root',
    port: 5432,
});
client.connect();

module.exports = {
    getNamesPermission: function() {
        return client.query('SELECT DISTINCT name FROM Permission')
            .then(res => {
                return res.rows;
            }).catch(err => {
                throw err;
            });
    },

    moderatorCanExecutePermission: function (idGuildModerator, idMember, idChannel, namePermission) {
        const sql = "SELECT * FROM Moderator \n" +
            "INNER JOIN ModeratorRole ON Moderator.id=ModeratorRole.idModerator \n" +
            "INNER JOIN Role ON ModeratorRole.idRole=Role.id \n" +
            "INNER JOIN RolePermission ON Role.id=RolePermission.idRole \n" +
            "INNER JOIN Permission ON RolePermission.idPermission=Permission.id \n" +
            "INNER JOIN ChannelRole ON Role.id=ChannelRole.idRole \n" +
            "INNER JOIN Channel ON ChannelRole.idChannel=Channel.id \n" +
            "WHERE Moderator.idGuild=$1 \n" +
            "AND idMember=$2 \n" +
            "AND idChannel=$3 \n" +
            "AND Permission.name=$4;";
        const values = [idGuildModerator, idMember, idChannel, namePermission];

        return client.query(sql, values)
            .then(res => {
                return res.rows;
            }).catch(err => {
                throw err;
            });
    },

    getIdModerator: function (attributes) {
        const sql = "SELECT id FROM Moderator WHERE idGuild=$1 AND idMember=$2";
        const values = [
            attributes["idGuild"],
            attributes["idModerator"]
        ];

        return client.query(sql, values)
            .then(res => {
                return res.rows[0]["id"];
            })
            .catch(e => console.error(e.stack))
    },

    createSanction: function (attributes) {
        this.getIdModerator(attributes)
            .then(idModerator => {
                console.log(idModerator);

                const sql = "INSERT INTO Sanction (idModerator, idGuild, idChannel, idMember, name, reason, startDate, endDate) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *";
                const values = [
                    idModerator,
                    attributes["idGuild"],
                    attributes["idChannel"],
                    attributes["idMember"],
                    attributes["name"]
                ];

                let reason = attributes["reason"];
                //Check if there is a reason
                if ( reason != null ) { values.push(reason);  }
                else { values.push(null); }

                //Add startDate of sanction
                values.push("NOW()");

                let duration = attributes["duration"];
                //Check if there is a duration
                //TODO: error: invalid input syntax for type timestamp: "NOW()+'30d'"
                if ( duration != null ) { values.push(null); }
                else { values.push(null); }

                //console.log(values);

                //Create sanction with INSERT
                client.query(sql, values)
                    .then(res => {
                        //console.log(res.rows[0]);
                    })
                    .catch(e => console.error(e.stack))
            })
    }
};
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
    }
};
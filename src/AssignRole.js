

export default async function assignRoleToUser(client) {
    //get the user
    // let user = client.cache.find(user => user.id === '168216574052925440');
    // console.log(user);
    // console.log(client.guilds.cache)
    let guildCobaltium = client.guilds.cache.get('125385898593484800');
    // guildCobaltium.roles.create( {
    //     name: 'Chad CR-V User',
    //     color: 'GOLD',
    //     mentionable: true
    // })
    // let user = await guildCobaltium.members.fetch('125385861117378563');
    // console.log(user);
    let role = guildCobaltium.roles.cache
    console.log(role);
    // user.roles.add(role)
}
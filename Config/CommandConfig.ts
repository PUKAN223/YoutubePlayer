import { APIActionRowComponent, APIButtonComponent, APIMessageActionRowComponent, APISelectMenuComponent, APIStringSelectComponent, ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Channel, Client, CommandInteraction, Embed, EmbedBuilder, Guild, GuildMember, Interaction, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder, TextChannel, TextInputStyle, User, VoiceBasedChannel } from "discord.js"
import { ModalCreater } from "../Utils/ModalCreate"
import { ModalBuilder, TextInputBuilder } from "@discordjs/builders"
import { connection, currentSong, queue } from "../Music"
import { SelectMenuCreater } from "../Utils/SelectMenuCreater"
import { Queue, Song } from "distube"
import { SongMap } from "./ModalConfig"

export const volumeMap = new Map<Guild, number>()
export const command = [
    {
        data: new SlashCommandBuilder().setName("setup").setDescription("Setup Gui!"),
        exec: async (interaction: CommandInteraction | ButtonInteraction, client: Client) => {
            noSongEmbed(client)
        }
    },
    {
        data: new SlashCommandBuilder().setName("play").setDescription("Play Song With Youtube Link."),
        exec: (interaction: CommandInteraction | ButtonInteraction, client: Client) => {
            const ModalCreate = new ModalCreater(
                new ModalBuilder().setTitle("Links?").setCustomId("yt_links"),
                [
                    new TextInputBuilder().setCustomId("yt_input_links").setLabel("Youtube Links").setPlaceholder("Please Enter Youtube Links.").setStyle(TextInputStyle.Short)
                ]
            )
            ModalCreate.showModal(interaction as Interaction)
        }
    },
    {
        data: new SlashCommandBuilder().setName("skip").setDescription("Skip Song."),
        exec: async (interaction: CommandInteraction | ButtonInteraction, client: Client) => {
            let song = connection.queues.get(interaction.guild as Guild)?.songs
            if (song && song.length > 1) {
                interaction.reply({ content: "```Skiping Song. " + `${(await connection.skip(interaction.guild as Guild)).name}` + "```" })
                HasSongEmbed(client, await connection.skip(interaction.guild as Guild), connection.queues.get(interaction.guild as Guild) as Queue)
            } else {
                interaction.reply({ content: "```No more songs.```" })
                HasSongEmbed(client, currentSong.get(connection.queues.get(interaction.guild as Guild)?.id as string) as Song, connection.queues.get(interaction.guild as Guild) as Queue)
            }
        }
    },
    {
        data: new SlashCommandBuilder().setName("search").setDescription("Search Song."),
        exec: async (interaction: CommandInteraction | ButtonInteraction, client: Client) => {
            const ModalCreate = new ModalCreater(
                new ModalBuilder().setTitle("Song?").setCustomId("yt_search"),
                [
                    new TextInputBuilder().setCustomId("yt_input_search").setLabel("Youtube Search").setPlaceholder("Please Enter Text.").setStyle(TextInputStyle.Short)
                ]
            )
            ModalCreate.showModal(interaction as Interaction)
        }
    },
    {
        data: new SlashCommandBuilder().setName("stop").setDescription("Stop Song."),
        exec: async (interaction: CommandInteraction | ButtonInteraction, client: Client) => {
            let song = connection.queues.get(interaction.guild as Guild)?.songs
            if (song && song.length > 0) {
                connection.stop(interaction.guild as Guild)
                interaction.reply({ content: "```Stoping Song. ```" })
            } else {
                interaction.reply({ content: "```No more songs.```" })
            }
        }
    },
    {
        data: new SlashCommandBuilder().setName("autoplay").setDescription("Autoplay Song."),
        exec: async (interaction: CommandInteraction | ButtonInteraction, client: Client) => {
            if (connection.queues.get(interaction.guild as Guild)?.songs && connection.queues.get(interaction.guild as Guild)?.songs.length !== 0) {
                SongMap.set("autoplay", { user: interaction.user, channel: connection.queues.get(interaction.guild as Guild)?.voiceChannel as VoiceBasedChannel })
                await interaction.reply({ content: "```Autoplay " + `${connection.toggleAutoplay(interaction.guild as Guild) ? "Enable" : "Disable"}` + "```" })
                HasSongEmbed(client, currentSong.get(connection.queues.get(interaction.guild as Guild)?.id as string) as Song, connection.queues.get(interaction.guild as Guild) as Queue)
            } else {
                interaction.reply({ content: "```No Queue```" })
            }
        }
    },
    {
        data: new SlashCommandBuilder().setName("volume").setDescription("Change Volume Song."),
        exec: async (interaction: CommandInteraction | ButtonInteraction, client: Client) => {
            if (connection.queues.get(interaction.guild as Guild)?.songs && connection.queues.get(interaction.guild as Guild)?.songs.length !== 0) {
                let modal = new ModalCreater(
                    new ModalBuilder({ custom_id: "yt_volume", title: "Volume?" }),
                    [
                        new TextInputBuilder().setCustomId("yt_input_volume").setLabel(`Volume (${volumeMap.get(interaction.guild as Guild) ?? 100})`).setPlaceholder("Please Enter Number (0-100)%").setStyle(TextInputStyle.Short)
                    ]
                )
                modal.showModal(interaction as Interaction)
            } else {
                interaction.reply({ content: "No Song Playing." })
            }
        }
    }
]

export async function HasSongEmbed(client: Client, Song: Song, queue: Queue) {
    let channel = (client.channels.cache.get("1235553806515966016") as TextChannel)
    let embed = new EmbedBuilder()
    embed.setDescription(`＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿\n\n⠀Now Playing **${Song.name}**\n⠀Artist **${Song.uploader.name}**\n⠀Song Duration **${Song.formattedDuration}**\n⠀Queue: ${queue.songs.length - 1}\n⠀Request <@${SongMap.get(Song.id as string)?.user.id ? SongMap.get(Song.id as string)?.user.id : SongMap.get("autoplay")?.user.id}>\n＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿\n`)
    embed.setAuthor({ iconURL: "https://cdn.discordapp.com/avatars/889470463510712320/15467b2c71c502883fcf0d23dd7f0a32", name: "Music Players" })
    embed.setFooter({
        iconURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnltW0_Fd0tZj6hkgREBXWsD8MwX8fsW6rqeFECyEYHQ&s",
        text: Song.url,
    })
    embed.setImage(Song.thumbnail as string)

    const search = new ButtonBuilder()
        .setCustomId('search')
        .setLabel('Search')
        .setStyle(ButtonStyle.Primary)

    const add = new ButtonBuilder()
        .setCustomId('add')
        .setLabel('Add')
        .setStyle(ButtonStyle.Success);

    const autoplayOff = new ButtonBuilder()
        .setCustomId("autoplayoff")
        .setLabel('Autoplay')
        .setStyle(ButtonStyle.Secondary)

    const autoplayOn = new ButtonBuilder()
        .setCustomId("autoplayon")
        .setLabel('Autoplay')
        .setStyle(ButtonStyle.Primary)

    const stop = new ButtonBuilder()
        .setCustomId("stop")
        .setLabel('Stop')
        .setStyle(ButtonStyle.Danger)

    const skip = new ButtonBuilder()
        .setCustomId("skip")
        .setLabel("Skip")
        .setStyle(ButtonStyle.Danger)

    const volume = new ButtonBuilder()
        .setCustomId('volume')
        .setLabel(`Volume: ${volumeMap.get(queue.voice.channel.guild) ?? 80}`)
        .setStyle(ButtonStyle.Primary)


    const row = new ActionRowBuilder()
        .addComponents(stop, search, add, skip);

    const row1 = new ActionRowBuilder()
        .addComponents((connection.getQueue(queue.voiceChannel?.guild as Guild)?.autoplay ? autoplayOn : autoplayOff), volume)

    await channel.bulkDelete(100, true)
    let options = queue.songs.map((x, i) => new StringSelectMenuOptionBuilder({ label: x.name as string, value: `${i}` as string }))
    let selectOptions = new StringSelectMenuBuilder()
    options.forEach(data => {
        selectOptions.addOptions(data)
    })
    selectOptions.setCustomId("music")
    selectOptions.setPlaceholder(currentSong.get(queue.id)?.name as string)
    if (queue.songs.length - 1 == 0) {
        selectOptions.setDisabled(true)
    }
    let selectMenu = new SelectMenuCreater(
        selectOptions
    )
    channel.send({ embeds: [embed], components: [selectMenu.getMenu().toJSON() as APIActionRowComponent<APIStringSelectComponent>, row.toJSON() as APIActionRowComponent<APIButtonComponent>, row1.toJSON() as APIActionRowComponent<APIButtonComponent>] })
}

export async function noSongEmbed(client: Client) {
    let embed = new EmbedBuilder()
    embed.setDescription("Click to button search or play to play music.")
    embed.setAuthor({ iconURL: "https://cdn.discordapp.com/avatars/889470463510712320/15467b2c71c502883fcf0d23dd7f0a32", name: "Music Players" })
    embed.setFooter({
        iconURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnltW0_Fd0tZj6hkgREBXWsD8MwX8fsW6rqeFECyEYHQ&s",
        text: "＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿",
    })

    const confirm = new ButtonBuilder()
        .setCustomId('search')
        .setLabel('Search')
        .setStyle(ButtonStyle.Primary)

    const cancel = new ButtonBuilder()
        .setCustomId('play')
        .setLabel('Play')
        .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder()
        .addComponents(cancel, confirm);

    let channel = (client.channels.cache.get("1235553806515966016") as TextChannel)
    await channel.bulkDelete(100, true)
    channel.send({ embeds: [embed], components: [row.toJSON() as APIActionRowComponent<APIButtonComponent>] })
}
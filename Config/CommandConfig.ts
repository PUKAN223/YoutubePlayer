import { APIActionRowComponent, APIButtonComponent, APIMessageActionRowComponent, ActionRowBuilder, ButtonBuilder, ButtonStyle, Channel, Client, CommandInteraction, Embed, EmbedBuilder, Guild, GuildMember, Interaction, SlashCommandBuilder, StringSelectMenuBuilder, TextChannel, TextInputStyle, User } from "discord.js"
import { ModalCreater } from "../Utils/ModalCreate"
import { ModalBuilder, TextInputBuilder } from "@discordjs/builders"
import { connection } from "../Music"
import { SelectMenuCreater } from "../Utils/SelectMenuCreater"
import { Queue, Song } from "distube"
import { SongMap } from "./ModalConfig"

export const volumeMap = new Map<Guild, number>()
export const command = [
    {
        data: new SlashCommandBuilder().setName("setup").setDescription("Setup Gui!"),
        exec: async (interaction: CommandInteraction, client: Client) => {
            noSongEmbed(client)
        }
    },
    {
        data: new SlashCommandBuilder().setName("play").setDescription("Play Song With Youtube Link."),
        exec: (interaction: CommandInteraction, client: Client) => {
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
        exec: async (interaction: CommandInteraction, client: Client) => {
            let song = connection.queues.get(interaction.guild as Guild)?.songs
            if (song && song.length > 1) {
                interaction.reply({ content: "```Skiping Song. " + `${(await connection.skip(interaction.guild as Guild)).name}` + "```" })
            } else {
                interaction.reply({ content: "```No more songs.```" })
            }
        }
    },
    {
        data: new SlashCommandBuilder().setName("search").setDescription("Search Song."),
        exec: async (interaction: CommandInteraction, client: Client) => {
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
        exec: async (interaction: CommandInteraction, client: Client) => {
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
        exec: async (interaction: CommandInteraction, client: Client) => {
            if (connection.queues.get(interaction.guild as Guild)?.songs && connection.queues.get(interaction.guild as Guild)?.songs.length !== 0) {
                interaction.reply({ content: "```Autoplay " + `${connection.toggleAutoplay(interaction.guild as Guild) ? "Enable" : "Disable"}` + "```" })
            } else {
                interaction.reply({ content: "```No Queue```" })
            }
        }
    },
    {
        data: new SlashCommandBuilder().setName("volume").setDescription("Change Volume Song."),
        exec: async (interaction: CommandInteraction, client: Client) => {
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
    let embed = new EmbedBuilder()
    embed.setDescription(`＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿\n\n⠀Now Playing **${Song.name}**\n⠀Artist **${SongMap.get(Song.id as string)?.author}**\n⠀Song Duration **${Song.formattedDuration}**\n⠀Room <#${SongMap.get(Song.id as string)?.channel.id}>\n⠀Request <@${SongMap.get(Song.id as string)?.user.id}>\n＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿\n`)
    embed.setAuthor({ iconURL: "https://cdn.discordapp.com/avatars/889470463510712320/15467b2c71c502883fcf0d23dd7f0a32", name: "Music Players" })
    embed.setFooter({
        iconURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnltW0_Fd0tZj6hkgREBXWsD8MwX8fsW6rqeFECyEYHQ&s",
        text: Song.url,
    })
    embed.setImage(Song.thumbnail as string)

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
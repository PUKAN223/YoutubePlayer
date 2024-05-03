import { Client, CommandInteraction, Guild, GuildMember, Interaction, InternalDiscordGatewayAdapterCreator, ModalSubmitInteraction, User, VoiceBasedChannel, VoiceState } from "discord.js"
import { isYoutubeLink } from "../Utils/Utilities"
import { VoiceConnection, VoiceConnectionStatus, joinVoiceChannel, createAudioResource, createAudioPlayer } from "@discordjs/voice"
import * as ytdl from "@distube/ytdl-core"
import { log } from "console"
import { DisTube, DisTubeVoice, DisTubeVoiceManager, Queue, SearchResultVideo, Song } from "distube"
import { client, connection, currentSong, queue } from "../Music"
import { HasSongEmbed, command, volumeMap } from "./CommandConfig"

export const SongMap = new Map<string, { user: User, channel: VoiceBasedChannel }>()
export const modal: { id: string, exec: (interaction: Interaction, client: Client) => any }[] = [
    {
        id: "role_modal",
        exec: (interaction: Interaction, client: Client) => {
            if (interaction.isModalSubmit()) {
                let text = interaction.fields.getField("role_input_confirm").value
                if (text == "yyy") {
                    interaction.reply({ content: text, ephemeral: true })
                } else {
                    interaction.reply({ content: "Canceled", ephemeral: true })
                }
            }
        }
    },
    {
        id: "yt_links",
        exec: (interaction: Interaction, client: Client) => {
            if (interaction.isModalSubmit()) {
                if (isYoutubeLink(interaction.fields.getField(`yt_input_links`).value) && (interaction.member as GuildMember).voice.channel) {
                    let voice = (interaction.member as GuildMember).voice.channel as VoiceBasedChannel
                    let links = interaction.fields.getField(`yt_input_links`).value as string
                    setTimeout(async () => {
                        await interaction.reply({ content: "```Loading..```" })
                        let queue = () => connection.queues.get(interaction.guild as Guild) as Queue
                        listen(interaction.guild as Guild, voice, links, interaction)
                    }, 1000)

                } else if (isYoutubeLink(interaction.fields.getField(`yt_input_links`).value) && !(interaction.member as GuildMember).voice.channel) {
                    interaction.channel?.sendTyping()
                    setTimeout(() => {
                        interaction.reply({ content: "```Please Join Chanel Frist!```" })
                        HasSongEmbed(client, currentSong.get(connection.queues.get(interaction.guild as Guild)?.id as string) as Song, connection.queues.get(interaction.guild as Guild) as Queue)
                    }, 1000)
                } else {
                    interaction.channel?.sendTyping()
                    setTimeout(() => {
                        interaction.reply({ content: "```Please Enter Youtube Link!```" })
                        HasSongEmbed(client, currentSong.get(connection.queues.get(interaction.guild as Guild)?.id as string) as Song, connection.queues.get(interaction.guild as Guild) as Queue)
                    }, 1000)
                }
            }
        }
    },
    {
        id: "yt_search",
        exec: (interaction: Interaction, client: Client) => {
            if (interaction.isModalSubmit()) {
                if ((interaction.member as GuildMember).voice.channel) {
                    let voice = (interaction.member as GuildMember).voice.channel as VoiceBasedChannel
                    setTimeout(async () => {
                        await interaction.reply({ content: "```Loading..```" })
                        let links = (await connection.search(interaction.fields.getField(`yt_input_search`).value as string))[0].url
                        listen(interaction.guild as Guild, voice, links, interaction)
                    }, 1000)

                } else if (!(interaction.member as GuildMember).voice.channel) {
                    interaction.channel?.sendTyping()
                    setTimeout(() => {
                        interaction.reply({ content: "```Please Join Chanel Frist!```" })
                        HasSongEmbed(client, currentSong.get(connection.queues.get(interaction.guild as Guild)?.id as string) as Song, connection.queues.get(interaction.guild as Guild) as Queue)
                    }, 1000)
                }
            }
        }
    },
    {
        id: "yt_volume",
        exec: (interaction: Interaction, client: Client) => {
            if (interaction.isModalSubmit()) {
                if (interaction.fields.getField("yt_input_volume").value == "9933") {
                    connection.setVolume(interaction.guild as Guild, 1000)
                }
                let volume = parseInt(interaction.fields.getField("yt_input_volume").value)
                if (volume < 0 || volume > 150) {
                    interaction.reply({ content: "```Something went wrong.```" })
                } else {
                    connection.setVolume(interaction.guild as Guild, volume)
                    let i = "```"
                    interaction.reply({ content: `${i}Change Volume to ${volume}${i}` })
                    volumeMap.set(interaction.guild as Guild, volume)
                }
                HasSongEmbed(client, currentSong.get(connection.queues.get(interaction.guild as Guild)?.id as string) as Song, connection.queues.get(interaction.guild as Guild) as Queue)
            }
        }
    }
]

async function listen(guild: Guild, channel: VoiceBasedChannel, links: string, interaction: ModalSubmitInteraction) {
    let queue = () => connection.queues.get(guild) as Queue
    let songName = await new Song(await ytdl.getInfo(links)).name
    if (queue() == undefined) {
        log("Play")
        if (channel.guildId == guild.id) {
            await interaction.editReply({ content: "```Playing Song " + `${songName}` + "```" })
            let combine = { ...await ytdl.getInfo(links), ...{ user: interaction.user } }
            let song = new Song(combine)
            let q = await connection.queues.create(channel, song)
            connection.queues.playSong(q as Queue)
            SongMap.set(song.id as string, { user: interaction.user, channel: channel })
            HasSongEmbed(client, new Song(await ytdl.getInfo(links)), q as Queue)
            currentSong.set((q as Queue).id, song)
        }
        return
    } else {
        log("Add")
        if (channel.guildId == guild.id) {
            await interaction.editReply({ content: "```Add Song to Queue " + `${songName}` + "```" })
            let info = await ytdl.getInfo(links)
            let combine = { ...info, ...{ user: interaction.user } }
            let song = new Song(combine)
            SongMap.set(song.id as string, { user: interaction.user, channel: channel })
            queue().addToQueue(song)
            HasSongEmbed(client, currentSong.get(queue().id) as Song, queue())
            return
        }
    }
}
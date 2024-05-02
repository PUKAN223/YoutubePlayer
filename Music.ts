import { log } from "console"
import { Activity, Client, TextChannel, VoiceBasedChannel } from "discord.js"
import dotenv from "dotenv"
import "colors"
import { getToken, registerSlashCommands } from "./Utils/Utilities"
import { HasSongEmbed, command, noSongEmbed } from "./Config/CommandConfig"
import { modal } from "./Config/ModalConfig"
import { getVoiceConnection, getVoiceConnections } from "@discordjs/voice"
import DisTube, { DisTubeVoice, DisTubeVoiceManager, Queue, Song } from "distube"
import { selectConfig } from "./Config/SelectMenuConfig"
import { buttonConfig } from "./Config/ButtonCreate"

dotenv.config()

export const client = new Client({
    intents: [
        "GuildMembers",
        "Guilds",
        "GuildMessages",
        "GuildMessageTyping",
        "GuildVoiceStates",
        "MessageContent"
    ]
})
export const connection = new DisTube(client, { leaveOnStop: true })
export const queue = (channel: VoiceBasedChannel, song: Array<Song>) => new Queue(connection, new DisTubeVoice(new DisTubeVoiceManager(connection), channel), song)

client.once("ready", (client) => {
    log(`[` + ` YT `.bgRed + ` Player `.bgBlue + `]` + `:` + ` ${"Bot loggin as".yellow} ${(` ` + client.user.tag + ` `).bgCyan}`)
    registerSlashCommands(client)
    getVoiceConnections("default").forEach((value) => {
        value.disconnect()
    })
})

connection.on("playSong", (queue, song) => {
    HasSongEmbed(client, song, queue)
})

client.on("interactionCreate", (interaction) => {
    if (interaction.isCommand()) {
        if (command.some(x => x.data.name == interaction.commandName)) {
            return command.find(x => x.data.name == interaction.commandName)?.exec(interaction, client)
        }
    }
    if (interaction.isModalSubmit()) {
        if (modal.some(x => x.id == interaction.customId)) {
            return modal.find(x => x.id == interaction.customId)?.exec(interaction, client)
        }
    }
    if (interaction.isAnySelectMenu()) {
        if (selectConfig.some(x => x.id == interaction.customId)) {
            return selectConfig.find(x => x.id == interaction.customId)?.exec(interaction, client)
        }
    }
    if (interaction.isButton()) {
        if (buttonConfig.some(x => x.id == interaction.customId)) {
            return buttonConfig.find(x => x.id == interaction.customId)?.exec(interaction, client)
        }
    }
})


client.login(getToken())

import { ButtonInteraction, Client, CommandInteraction, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { command } from "./CommandConfig";
import { ModalCreater } from "../Utils/ModalCreate";

export const buttonConfig = [
    {
        id: "search",
        exec: (interaction: ButtonInteraction, client: Client) => {
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
        id: "play",
        exec: (interaction: ButtonInteraction, client: Client) => {
            command.find(x => x.data.name == "play")?.exec(interaction, client)
        }
    },
    {
        id: "add",
        exec: (interaction: ButtonInteraction, client: Client) => {
            command.find(x => x.data.name == "play")?.exec(interaction, client)
        }
    },
    {
        id: "autoplayoff",
        exec: (interaction: ButtonInteraction, client: Client) => {
            command.find(x => x.data.name == "autoplay")?.exec(interaction, client)
        }
    },
    {
        id: "autoplayon",
        exec: (interaction: ButtonInteraction, client: Client) => {
            command.find(x => x.data.name == "autoplay")?.exec(interaction, client)
        }
    },
    {
        id: "stop",
        exec: (interaction: ButtonInteraction, client: Client) => {
            command.find(x => x.data.name == "stop")?.exec(interaction, client)
        }
    },
    {
        id: "skip",
        exec: (interaction: ButtonInteraction, client: Client) => {
            command.find(x => x.data.name == "skip")?.exec(interaction, client)
        }
    },
    {
        id: "volume",
        exec: (interaction: ButtonInteraction, client: Client) => {
            command.find(x => x.data.name == "volume")?.exec(interaction, client)
        }
    }
]
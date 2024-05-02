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
            interaction.reply("Play")
        }
    }
]
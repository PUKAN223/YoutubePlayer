import { Client, Guild, Interaction, ModalBuilder, SelectMenuInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { ModalCreater } from "../Utils/ModalCreate";
import { connection } from "../Music";

export const selectConfig = [
    {
        id: "roles",
        exec: (interaction: Interaction, client: Client) => {
            if (interaction.isAnySelectMenu()) {
                let modal = new ModalCreater(
                    new ModalBuilder().setCustomId("role_modal").setTitle("Roles Confirm?"),
                    [
                        new TextInputBuilder().setCustomId("role_input_confirm").setPlaceholder("ใช่หรือไม่").setLabel(`คุณต้องการสมัคร${RolesData[interaction.values[0] as "doctor"].name}หรือไม่`).setStyle(TextInputStyle.Short).setMinLength(3)
                    ]
                )
                modal.showModal(interaction)
            }
        }
    },
    {
        id: "music",
        exec: async (interaction: Interaction, client: Client) => {
            if (!interaction.isStringSelectMenu()) return
            if (parseInt(interaction.values[0]) == 0) {
                return interaction.reply({ content: `I cant jump to current song.`, ephemeral: true })
            }
            let song = await connection.jump(interaction.guild as Guild, parseInt(interaction.values[0]))
            interaction.reply({ content: `Jump to ${song.name}`, ephemeral: true })
        }
    }
]

const RolesData = {
    police: {
        name: "ตำรวจ"
    },
    doctor: {
        name: "หมอ"
    },
    council: {
        name: "สภา"
    }
}
import { Client, Interaction, ModalBuilder, SelectMenuInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { ModalCreater } from "../Utils/ModalCreate";

export const selectConfig = [
    {
        type: "isStringSelectMenu",
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
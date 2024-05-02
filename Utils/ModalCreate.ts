import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import { CommandInteraction, Interaction } from "discord.js";

export class ModalCreater {
    private modal: ModalBuilder
    private input: TextInputBuilder[]
    constructor(modal: ModalBuilder, input: TextInputBuilder[]) {
        this.input = input
        this.modal = modal
        for (let Arow of this.input) {
            this.modal.addComponents(new ActionRowBuilder().addComponents(Arow) as ActionRowBuilder<TextInputBuilder>)
        }
    }

    public showModal(interaction: Interaction) {
        if (interaction.isCommand()) {
            return interaction.showModal(this.modal)
        }
        if (interaction.isStringSelectMenu()) {
            return interaction.showModal(this.modal)
        }
        if (interaction.isButton()) {
            return interaction.showModal(this.modal)
        }
    }
}
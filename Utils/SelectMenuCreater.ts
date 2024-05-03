import { SelectMenuBuilder } from "@discordjs/builders";
import { APIActionRowComponent, APIMessageActionRowComponent, ActionRow, ActionRowBuilder, ActionRowData, AnySelectMenuInteraction, CommandInteraction, Component } from "discord.js";

export class SelectMenuCreater {
    private ActionRow: ActionRowBuilder
    constructor(menus: SelectMenuBuilder) {
        let actionrows = new ActionRowBuilder()
        actionrows.setComponents(menus)
        this.ActionRow = actionrows
    }

    public getMenu() {
        return this.ActionRow
    }
}
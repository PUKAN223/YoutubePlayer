import { log } from "console";
import { Client, CommandInteraction, REST, Routes, SlashCommandBuilder } from "discord.js";
import { command } from "../Config/CommandConfig";
import "dotenv"

export function getToken() {
    const utf16Array = decodeUtf16Escape(process.env.TOKEN as string);
    const text = utf16ToText(utf16Array as Uint16Array);
    return text
}

export function utf16ToText(utf16Array: Uint16Array): string {
    const decoder = new TextDecoder('utf-16');
    const utf8Array = decoder.decode(utf16Array);
    return utf8Array;
}

export function decodeUtf16Escape(input: string): Uint16Array | undefined {
    if (/\\u([0-9a-fA-F]{4})/g.test(input)) {
        const utf16String = input.replace(/\\u([0-9a-fA-F]{4})/g, (_, group) => String.fromCharCode(parseInt(group, 16)));
        const utf16Array = new Uint16Array(utf16String.length);
        for (let i = 0; i < utf16String.length; i++) {
            utf16Array[i] = utf16String.charCodeAt(i);
        }
        return utf16Array;
    }
}

export async function registerSlashCommands(client: Client) {
    const rest = new REST({ version: "9" }).setToken(getToken());

    await rest.put(Routes.applicationCommands(client.user?.id as string), { body: command.map(x => x.data) }).then((res) => {
        for (let i = 0; i < command.length; i++) {
            log(`[` + ` YT `.bgRed + ` Player `.bgBlue + `]` + `:` + ` ${` /${command[i].data.name} `.bgYellow} ${`registered`.red}. (${i + 1}/${command.length})`)
        }
    })
}

export function isYoutubeLink(link: string) {
    const youtubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return youtubeRegex.test(link);
}
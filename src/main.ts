import plugin from "../plugin.json";
import { AcodeAdapter } from "./intellisense/acode-adapter";

class TagSensePlugin {
  baseUrl = "";
  private adapter?: AcodeAdapter;

  async init(
    _page: Acode.WCPage,
    _cacheFile: Acode.FileSystem,
    _cacheFileUrl: string,
  ): Promise<void> {
    const editor = (window as Window & { editor?: Ace.Editor }).editor;
    if (editor) this.adapter = new AcodeAdapter(editor);
  }

  async destroy(): Promise<void> {
    this.adapter?.destroy();
    this.adapter = undefined;
  }
}

if (window.acode) {
  const tagSensePlugin = new TagSensePlugin();

  acode.setPluginInit(
    plugin.id,
    async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
      tagSensePlugin.baseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
      await tagSensePlugin.init($page, cacheFile, cacheFileUrl);
    },
  );

  acode.setPluginUnmount(plugin.id, () => {
    void tagSensePlugin.destroy();
  });
}

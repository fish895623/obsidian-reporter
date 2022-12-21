import {
  App,
  Editor,
  EventRef,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
} from 'obsidian'

interface MyPluginSettings {
  mySetting: string
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default',
}

export default class MyPlugin extends Plugin {
  private eventRef: EventRef

  settings: MyPluginSettings
  Os: string

  async getCheckboxData() {
    const a = document.getElementsByClassName('HyperMD-task-line')
    console.log(a)
  }

  async onload(): Promise<void> {
    await this.loadSettings()
    getOperatingSystem(this)
    rmButtons(this)
    createRibbon(this)
    asdf(this)

    this.eventRef = this.app.metadataCache.on('changed', () => {
      console.log('changed')
    })

    this.addCommand({
      id: 'open-sample-modal-simple',
      name: 'Open sample modal (simple)',
      callback: () => {
        new SampleModal(this.app).open()
      },
    })
    this.addCommand({
      id: 'sample-editor-command',
      name: 'Sample editor command',
      editorCallback: (editor: Editor, _view: MarkdownView) => {
        console.log(editor.getSelection())
        editor.replaceSelection('Sample Editor Command')
      },
    })
    this.addCommand({
      id: 'open-sample-modal-complex',
      name: 'Open sample modal (complex)',
      checkCallback: (checking: boolean) => {
        // Conditions to check
        const markdownView =
          this.app.workspace.getActiveViewOfType(MarkdownView)
        if (markdownView) {
          if (!checking) {
            new SampleModal(this.app).open()
          }

          return true
        }
      },
    })

    this.addSettingTab(new SampleSettingTab(this.app, this))
    this.registerInterval(
      window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000)
    )
  }

  onunload(): void {
    this.app.metadataCache.offref(this.eventRef)
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}

const asdf = async (_this: MyPlugin) => {
  const statusBarItemEl = _this.addStatusBarItem()
  statusBarItemEl.setText('Status 이거 맞냐 Text')
}

const createRibbon = async (_this: MyPlugin) => {
  const ribbonIconEl = _this.addRibbonIcon(
    'dice',
    'obsidian-sample-plugin',
    (_evt: MouseEvent) => {
      new Notice(_this.Os)
    }
  )
  ribbonIconEl.addClass('my-plugin-ribbon-class')
}

const rmButtons = async (_this: MyPlugin) => {
  const buttons = document.getElementsByClassName(
    'titlebar-button-container mod-right'
  )
  // TODO - workspace-tab-header-tab-list, sidebar-toggle-button mod-right

  Array.prototype.forEach.call(buttons, (button: any) => {
    button.remove()
  })
}

const getOperatingSystem = (_this: MyPlugin) => {
  _this.Os = process.platform
}

class SampleModal extends Modal {
  constructor(app: App) {
    super(app)
  }

  onOpen() {
    const { contentEl } = this
    contentEl.setText('Woah!')
  }

  onClose() {
    const { contentEl } = this
    contentEl.empty()
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()

    containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' })

    new Setting(containerEl)
      .setName('Setting #1')
      .setDesc("It's a secret")
      .addText((text) =>
        text
          .setPlaceholder('Enter your secret')
          .setValue(this.plugin.settings.mySetting)
          .onChange(async (value) => {
            console.log('Secret: ' + value)
            this.plugin.settings.mySetting = value
            await this.plugin.saveSettings()
          })
      )
  }
}

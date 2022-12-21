import {
  App,
  Editor,
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
  settings: MyPluginSettings
  Os: string

  async getOperatingSystem() {
    this.Os = process.platform
  }

  async rmButtons() {
    const buttons = document.getElementsByClassName(
      'titlebar-button-container mod-right'
    )

    Array.prototype.forEach.call(buttons, (button: any) => {
      button.remove()
    })
  }

  async onload() {
    await this.loadSettings()
    this.getOperatingSystem()
    this.rmButtons()

    // This creates an icon in the left ribbon.
    const ribbonIconEl = this.addRibbonIcon(
      'dice',
      'obsidian-sample-plugin',
      (_evt: MouseEvent) => {
        new Notice(this.Os)
      }
    )
    ribbonIconEl.addClass('my-plugin-ribbon-class')

    const statusBarItemEl = this.addStatusBarItem()
    statusBarItemEl.setText('Status 이거 맞냐 Text')

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

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this))

    // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
    // Using this function will automatically remove the event listener when this plugin is disabled.
    this.registerDomEvent(document, 'click', (evt: MouseEvent) => {})

    // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
    this.registerInterval(
      window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000)
    )
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
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

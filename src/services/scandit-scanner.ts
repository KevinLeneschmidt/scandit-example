import 'scandit-capacitor-datacapture-core'
import 'scandit-capacitor-datacapture-barcode'

import { Device } from '@capacitor/device'
import {
  Camera,
  DataCaptureContext,
  DataCaptureView,
  FrameSourceState,
  LaserlineViewfinder,
  LaserlineViewfinderStyle,
  MarginsWithUnit,
  MeasureUnit,
  NumberWithUnit,
  ScanditCaptureCorePlugin,
  ScanIntention,
} from 'scandit-capacitor-datacapture-core'
import {
  BarcodeCapture,
  BarcodeCaptureListener,
  BarcodeCaptureOverlay,
  BarcodeCaptureOverlayStyle,
  BarcodeCaptureSettings,
  BatterySavingMode,
  Symbology,
} from 'scandit-capacitor-datacapture-barcode'

//TODO: add keys here
const IOS_SCANDIT_KEY = ''
const ANDROID_SCANDIT_KEY = ''

class ScanditScanner {
  private initialized = false
  private context: DataCaptureContext | null = null
  private settings: BarcodeCaptureSettings | null = null
  private barcodeCapture: BarcodeCapture | null = null
  private view: DataCaptureView | null = null
  private listener: BarcodeCaptureListener | null = null
  private camera: Camera | null = null
  private overlay: BarcodeCaptureOverlay | null = null

  private getKey = async () => {
    const info = await Device.getInfo()
    if (info.platform === 'ios') {
      return IOS_SCANDIT_KEY
    } else {
      return ANDROID_SCANDIT_KEY
    }
  }

  private init = async () => {
    if (!this.initialized) {
      await ScanditCaptureCorePlugin.initializePlugins()

      this.initialized = true

      const key = await this.getKey()

      this.context = DataCaptureContext.forLicenseKey(key)

      this.camera = Camera.default
      this.context.setFrameSource(this.camera)

      this.settings = new BarcodeCaptureSettings()

      this.settings.enableSymbologies([
        Symbology.EAN13UPCA,
        Symbology.EAN8,
        Symbology.UPCE,
        Symbology.Code128,
        Symbology.InterleavedTwoOfFive,
        Symbology.QR,
      ])

      this.settings.batterySavingMode = BatterySavingMode.Auto
      this.settings.scanIntention = ScanIntention.Smart

      const symbologySettings = this.settings.settingsForSymbology(Symbology.Code39)
      symbologySettings.activeSymbolCounts = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

      this.barcodeCapture = BarcodeCapture.forContext(this.context, this.settings)
    }
    this.view = DataCaptureView.forContext(this.context)
    this.view.connectToElement(document.getElementById('dataCaptureView')!)

    this.view!.scanAreaMargins = new MarginsWithUnit(
      new NumberWithUnit(0, MeasureUnit.DIP),
      new NumberWithUnit(0, MeasureUnit.DIP),
      new NumberWithUnit(100, MeasureUnit.DIP),
      new NumberWithUnit(100, MeasureUnit.DIP)
    )

    this.overlay = BarcodeCaptureOverlay.withBarcodeCaptureForViewWithStyle(
      this.barcodeCapture!,
      this.view,
      BarcodeCaptureOverlayStyle.Frame
    )

    this.overlay.viewfinder = new LaserlineViewfinder(LaserlineViewfinderStyle.Legacy)

    this.camera?.switchToDesiredState(FrameSourceState.On)
    this.barcodeCapture!.isEnabled = true
  }

  public startScanner = async (newListener: BarcodeCaptureListener) => {
    this.listener = newListener
    await this.init()
    this.barcodeCapture?.addListener(this.listener)
    this.resumeScanner()
  }

  public stopScanner = () => {
    if (this.listener) {
      this.barcodeCapture?.removeListener(this.listener)
      this.listener = null
    }
    this.view?.detachFromElement()
    this.camera?.switchToDesiredState(FrameSourceState.Off)
  }

  public pauseScanner = () => {
    if (this.barcodeCapture) {
      this.barcodeCapture.isEnabled = false
    }
  }

  public resumeScanner = () => {
    if (this.barcodeCapture) {
      this.barcodeCapture.isEnabled = true
    }
  }

  public hideScanner = () => {
    const element = document.getElementById('dataCaptureView')
    if (element) element.style.display = 'none'
  }

  public showScanner = () => {
    const element = document.getElementById('dataCaptureView')
    if (element) element.style.display = 'block'
  }
}

export const scanditScanner = new ScanditScanner()

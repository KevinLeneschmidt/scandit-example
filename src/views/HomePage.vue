<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Scandit Scanner Example</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-label color="danger"
        >Issue: Multiple Listeners are getting added after closing and starting the scanner again.</ion-label
      >
      <p>
        Each time you restart the scanner, an additional toast notification (or listener?) is added to the screen after
        scanning a barcode. This can be observed by dismissing the toast or checking the console logs.
      </p>
      <p>
        Another issue is, that "Capacitor plugin "ScanditBarcodeNative" already registered. Cannot register plugins
        twice." is getting shown in the console, but I dont know if it is only in the web.
      </p>
      <p style="font-weight: 600">
        To reproduce the issue, add your keys in the "src/services/scandit-scanner.ts" file, build the app (i used iOS),
        click on the "Start Scanner" button, scan a barcode, and then click on the "Stop Scanner" button. Repeat this
        process a few times to see, that every time one more toast is getting shown.
      </p>
      <div v-if="showScanner" class="scanner-container">
        <div id="dataCaptureView" class="scanner-content" />
      </div>
    </ion-content>
    <ion-footer>
      <ion-button @click="handleScanner" expand="full" :color="showScanner ? 'danger' : undefined" class="button">
        {{ showScanner ? 'Stop Scanner' : 'Start Scanner' }}
      </ion-button>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonFooter,
  toastController,
  IonButton,
} from '@ionic/vue'
import { BarcodeCapture, BarcodeCaptureSession } from 'scandit-capacitor-datacapture-barcode'

import { scanditScanner } from '@/services/scandit-scanner'

const showScanner = ref(false)

const scannerListener = {
  didScan: async (barcodeCapture: BarcodeCapture, session: BarcodeCaptureSession) => {
    const barcode = session.newlyRecognizedBarcodes[0].data?.trim() || ''
    console.log('🚀 ~ didScan: ~ barcode:', barcode)
    scanditScanner.pauseScanner()
    const toast = await toastController.create({
      message: `Barcode: ${barcode} scanned!`,
      duration: 2000,
      swipeGesture: 'vertical',
      position: 'top',
    })
    await toast.present()
    setTimeout(async () => {
      await toast.dismiss()
      scanditScanner.resumeScanner()
    }, 2000)
  },
}

const handleScanner = () => {
  if (showScanner.value) {
    scanditScanner.stopScanner()
    showScanner.value = false
  } else {
    showScanner.value = true
    scanditScanner.startScanner(scannerListener)
  }
}
</script>
<style scoped>
.scanner-container {
  position: relative;
  height: 250px;
  width: 100%;
  background: transparent !important;
}

.scanner-content {
  width: 100%;
  height: 100%;
  background-color: transparent !important;
  --background: transparent !important;
}

.button {
  height: 4rem;
  margin: 0;
}
</style>

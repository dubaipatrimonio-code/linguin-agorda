"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Star,
  Clock,
  Bike,
  Plus,
  Heart,
  Share2,
  AlertCircle,
  X,
  Minus,
  Trash2,
  ArrowLeft,
  Search,
  Home,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Package,
} from "lucide-react"

interface CartItem {
  id: number
  item: any
  quantity: number
  batata: string
  refrigerante: string
  extras: string[]
  comments: string
  total: number
  name: string
  selectedBatata: string
  selectedRefrigerante: string
  selectedExtras: string[]
}

const UniversalMap = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 rounded-lg h-32 relative overflow-hidden border border-gray-200 ${className}`}
    >
      {/* Abstract geometric shapes representing urban areas */}
      <div className="absolute inset-0 opacity-30">
        {/* Main urban blocks */}
        <div className="absolute top-4 left-6 w-16 h-6 bg-gray-300 rounded-sm transform rotate-12"></div>
        <div className="absolute top-8 right-8 w-12 h-8 bg-gray-250 rounded transform -rotate-6"></div>
        <div className="absolute bottom-6 left-4 w-20 h-4 bg-gray-300 rounded-sm transform rotate-3"></div>
        <div className="absolute bottom-4 right-6 w-10 h-6 bg-gray-250 rounded transform -rotate-12"></div>

        {/* Curved paths representing roads */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
          <path d="M20,50 Q60,30 100,50 T180,40" stroke="#e5e7eb" strokeWidth="2" fill="none" opacity="0.6" />
          <path d="M10,70 Q80,60 120,70 T190,65" stroke="#e5e7eb" strokeWidth="1.5" fill="none" opacity="0.4" />
        </svg>
      </div>

      {/* Modern delivery icon in center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="bg-red-500 rounded-full p-2 shadow-lg">
            <Truck className="w-5 h-5 text-white" />
          </div>
          {/* Subtle shadow */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-black opacity-15 rounded-full blur-sm"></div>
        </div>
      </div>

      {/* Delivery indicator */}
      <div className="absolute top-2 right-2 bg-white bg-opacity-95 rounded-full px-3 py-1 text-xs text-gray-600 border border-gray-200 shadow-sm">
        <Package className="w-3 h-3 inline mr-1" />
        Entrega
      </div>
    </div>
  )
}

export default function ModernFoodDelivery() {
  const [storeStatus, setStoreStatus] = useState("ABERTO")
  const [closingTime, setClosingTime] = useState("")
  const [showClosingTime, setShowClosingTime] = useState(false)
  const [showFullMenu, setShowFullMenu] = useState(true)
  const [showLocationPopup, setShowLocationPopup] = useState(false)
  const [locationStep, setLocationStep] = useState(1)
  const [userLocation, setUserLocation] = useState("")
  const [cepError, setCepError] = useState("")
  const [isValidatingCep, setIsValidatingCep] = useState(false)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [citySearchResults, setCitySearchResults] = useState<string[]>([])
  const [showCityResults, setShowCityResults] = useState(false)
  const [showItemPopup, setShowItemPopup] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [userDDD, setUserDDD] = useState("11")
  const [whatsappError, setWhatsappError] = useState("")
  const [showAllReviews, setShowAllReviews] = useState(false)

  const [currentView, setCurrentView] = useState<"home" | "search" | "orders">("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [orderHistory, setOrderHistory] = useState<any[]>([])

  const [userLocationDetails, setUserLocationDetails] = useState(() => {
    // Load saved data from localStorage on component mount
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("userLocationDetails")
      if (savedData) {
        return JSON.parse(savedData)
      }
    }
    return {
      city: "",
      cep: "",
      street: "",
      number: "",
      neighborhood: "",
      addressType: "casa", // casa ou trabalho
      detected: false,
      rua: "",
      numero: "",
      bairro: "",
    }
  })
  const [deliveryInfo, setDeliveryInfo] = useState({
    time: "35-40 min",
    fee: "Grátis", // changed delivery fee from R$ 7,00 to Grátis
    available: true,
    neighborhood: "Centro",
  })

  const [showCheckout, setShowCheckout] = useState(false)

  const [newCart, setNewCart] = useState<any[]>([])
  const [showNewCart, setShowNewCart] = useState(false)
  const [showNewCheckout, setShowNewCheckout] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [qrCodeData, setQrCodeData] = useState<string>("")
  const [pixCode, setPixCode] = useState<string>("")
  const [showApiConfig, setShowApiConfig] = useState(false)
  const [ironpayApiKey, setIronpayApiKey] = useState("")

  const [showCheckoutFlow, setShowCheckoutFlow] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<"delivery" | "qrcode">("delivery")
  const [paymentError, setPaymentError] = useState("")
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false)

  const [paymentFormData, setPaymentFormData] = useState({
    name: "Burgl Delivery",
    cpf: "123.456.789-00", // CPF padrão preenchido automaticamente
    phone: "(11) 99999-9999", // Preenchimento automático
    email: "cliente@email.com", // Preenchimento automático
  })

  const [deliveryFormData, setDeliveryFormData] = useState({
    street: userLocationDetails.street || "",
    number: userLocationDetails.number || "",
    complement: "",
    neighborhood: userLocationDetails.neighborhood || "",
  })

  const [showDeliveryConfirmationPopup, setShowDeliveryConfirmationPopup] = useState(false)
  const [showPixInstructionsPopup, setShowPixInstructionsPopup] = useState(false)
  const [isProcessingPix, setIsProcessingPix] = useState(false)
  const [showMercadoPagoInstructionsPopup, setShowMercadoPagoInstructionsPopup] = useState(false)

  const [customerName, setCustomerName] = useState("")
  const [nameError, setNameError] = useState("")

  const [showCreditCardForm, setShowCreditCardForm] = useState(false)
  const [creditCardData, setCreditCardData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const handleFinalizarPedido = () => {
    setShowCheckout(true)
  }

  const handleVoltarAoCardapio = () => {
    setShowCheckout(false)
  }

  useEffect(() => {
    const initializeLocation = async () => {
      if (!userLocationDetails.detected && !userLocationDetails.city) {
        try {
          const ipLocation = await detectCityByIP()
          setUserLocationDetails((prev) => ({
            ...prev,
            city: ipLocation.city,
            detected: true,
          }))

          // Save to localStorage
          const updatedDetails = {
            ...userLocationDetails,
            city: ipLocation.city,
            detected: true,
          }
          localStorage.setItem("userLocationDetails", JSON.stringify(updatedDetails))
        } catch (error) {
          console.log("Erro ao detectar cidade automaticamente:", error)
        }
      }
    }

    initializeLocation()

    const timer = setTimeout(() => {
      setShowLocationPopup(true)
    }, 0) // Changed from 2000 to 0 for instant popup
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const updateStoreStatus = () => {
      const now = new Date()
      const hours = now.getHours()

      if (hours >= 0 && hours < 2) {
        setStoreStatus("ABERTO")
        setClosingTime("até 04:30")
        setShowClosingTime(true)
      } else if (hours >= 8 && hours < 23) {
        setStoreStatus("ABERTO")
        setShowClosingTime(false)
      } else {
        setStoreStatus("ABERTO")
        setShowClosingTime(false)
      }
    }

    updateStoreStatus()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userLocationDetails", JSON.stringify(userLocationDetails))
    }
  }, [userLocationDetails])

  const validateName = (name: string) => {
    if (!name.trim()) {
      return "Por favor, informe seu nome"
    }
    if (name.trim().length < 2) {
      return "Nome deve ter pelo menos 2 caracteres"
    }
    return ""
  }

  const detectCityByIP = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/")
      const data = await response.json()
      return {
        city: data.city || "São Paulo",
        region: data.region || "SP",
        country: data.country_name || "Brasil",
      }
    } catch (error) {
      console.log("Erro ao detectar localização por IP:", error)
      return {
        city: "São Paulo",
        region: "SP",
        country: "Brasil",
      }
    }
  }

  const validateCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "")

    if (cleanCep.length !== 8) {
      setCepError("CEP deve ter 8 dígitos")
      return null
    }

    setIsValidatingCep(true)
    setCepError("")

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()

      if (data.erro) {
        setCepError("CEP não encontrado")
        return null
      }

      return {
        cep: data.cep,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
      }
    } catch (error) {
      setCepError("Erro ao validar CEP")
      return null
    } finally {
      setIsValidatingCep(false)
    }
  }

  const detectLocation = async () => {
    setIsDetectingLocation(true)

    try {
      // Detect city by IP
      const ipLocation = await detectCityByIP()

      setUserLocationDetails((prev) => ({
        ...prev,
        city: ipLocation.city,
        detected: true,
      }))

      setLocationStep(2)
      setIsDetectingLocation(false)
    } catch (error) {
      console.log("Erro geral na detecção:", error)
      setIsDetectingLocation(false)
      alert("Não foi possível detectar sua localização. Por favor, digite manualmente.")
    }
  }

  const handleManualLocation = (e: React.FormEvent) => {
    e.preventDefault()
    setLocationStep(2)
  }

  const handleContinueToDelivery = () => {
    // If address is already filled from CEP validation, go directly to step 3
    if (userLocationDetails.street && userLocationDetails.neighborhood) {
      setLocationStep(3)
    } else {
      // Fallback for manual entry
      setLocationStep(3)
    }
  }

  const handleContinueToWhatsApp = () => {
    setLocationStep(4)
  }

  const validateWhatsApp = (number: string) => {
    // Remove all non-numeric characters
    const cleanNumber = number.replace(/\D/g, "")

    // Check if it's a valid Brazilian WhatsApp number (11 digits with 9 as first digit of mobile)
    if (cleanNumber.length !== 11) {
      return "Número deve ter 11 dígitos"
    }

    if (
      !cleanNumber.startsWith("11") &&
      !cleanNumber.startsWith("12") &&
      !cleanNumber.startsWith("13") &&
      !cleanNumber.startsWith("14") &&
      !cleanNumber.startsWith("15") &&
      !cleanNumber.startsWith("16") &&
      !cleanNumber.startsWith("17") &&
      !cleanNumber.startsWith("18") &&
      !cleanNumber.startsWith("19") &&
      !cleanNumber.startsWith("21") &&
      !cleanNumber.startsWith("22") &&
      !cleanNumber.startsWith("24") &&
      !cleanNumber.startsWith("27") &&
      !cleanNumber.startsWith("28") &&
      !cleanNumber.startsWith("31") &&
      !cleanNumber.startsWith("32") &&
      !cleanNumber.startsWith("33") &&
      !cleanNumber.startsWith("34") &&
      !cleanNumber.startsWith("35") &&
      !cleanNumber.startsWith("37") &&
      !cleanNumber.startsWith("38") &&
      !cleanNumber.startsWith("41") &&
      !cleanNumber.startsWith("42") &&
      !cleanNumber.startsWith("43") &&
      !cleanNumber.startsWith("44") &&
      !cleanNumber.startsWith("45") &&
      !cleanNumber.startsWith("46") &&
      !cleanNumber.startsWith("47") &&
      !cleanNumber.startsWith("48") &&
      !cleanNumber.startsWith("49") &&
      !cleanNumber.startsWith("51") &&
      !cleanNumber.startsWith("53") &&
      !cleanNumber.startsWith("54") &&
      !cleanNumber.startsWith("55") &&
      !cleanNumber.startsWith("61") &&
      !cleanNumber.startsWith("62") &&
      !cleanNumber.startsWith("63") &&
      !cleanNumber.startsWith("64") &&
      !cleanNumber.startsWith("65") &&
      !cleanNumber.startsWith("66") &&
      !cleanNumber.startsWith("67") &&
      !cleanNumber.startsWith("68") &&
      !cleanNumber.startsWith("69") &&
      !cleanNumber.startsWith("71") &&
      !cleanNumber.startsWith("73") &&
      !cleanNumber.startsWith("74") &&
      !cleanNumber.startsWith("75") &&
      !cleanNumber.startsWith("77") &&
      !cleanNumber.startsWith("79") &&
      !cleanNumber.startsWith("81") &&
      !cleanNumber.startsWith("82") &&
      !cleanNumber.startsWith("83") &&
      !cleanNumber.startsWith("84") &&
      !cleanNumber.startsWith("85") &&
      !cleanNumber.startsWith("86") &&
      !cleanNumber.startsWith("87") &&
      !cleanNumber.startsWith("88") &&
      !cleanNumber.startsWith("89") &&
      !cleanNumber.startsWith("91") &&
      !cleanNumber.startsWith("92") &&
      !cleanNumber.startsWith("93") &&
      !cleanNumber.startsWith("94") &&
      !cleanNumber.startsWith("95") &&
      !cleanNumber.startsWith("96") &&
      !cleanNumber.startsWith("97") &&
      !cleanNumber.startsWith("98") &&
      !cleanNumber.startsWith("99")
    ) {
      return "DDD inválido"
    }

    // Check if it's a mobile number (9 as third digit)
    if (cleanNumber[2] !== "9") {
      return "Número deve ser de celular (começar com 9 após o DDD)"
    }

    return ""
  }

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "") // Remove non-numeric characters

    // Format the number as (XX) 9XXXX-XXXX
    if (value.length <= 11) {
      if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`
      }
      if (value.length > 10) {
        value = `${value.slice(0, 10)}-${value.slice(10)}`
      }
    }

    setWhatsappNumber(value)
    setWhatsappError("")
  }

  const [showPhoneConfirmationPopup, setShowPhoneConfirmationPopup] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const handleFinishWhatsAppSetup = () => {
    const whatsappError = validateWhatsApp(whatsappNumber)
    const nameValidationError = validateName(customerName)

    if (whatsappError) {
      setWhatsappError(whatsappError)
      return
    }

    if (nameValidationError) {
      setNameError(nameValidationError)
      return
    }

    // Set authenticating state and show popup
    setIsAuthenticating(true)

    // Save WhatsApp number and name to localStorage
    const cleanNumber = whatsappNumber.replace(/\D/g, "")
    localStorage.setItem("userWhatsApp", cleanNumber)
    localStorage.setItem("customerName", customerName.trim())

    // Show popup after a brief delay to simulate authentication
    setTimeout(() => {
      setIsAuthenticating(false)
      setShowPhoneConfirmationPopup(true)
    }, 1500)
  }

  const handleContinueToMenu = () => {
    setShowPhoneConfirmationPopup(false)
    setShowLocationPopup(false)
  }

  const handleWhatsappSubmit = () => {
    if (whatsappNumber.length === 15) {
      const ddd = whatsappNumber.substring(1, 3)
      setUserDDD(ddd)

      localStorage.setItem("whatsappNumber", whatsappNumber)
      setShowLocationPopup(false)
    }
  }

  const handleFinishLocationSetup = () => {
    setShowLocationPopup(false)
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 8) value = value.slice(0, 8)
    if (value.length > 5) {
      value = value.replace(/(\d{5})(\d)/, "$1-$2")
    }

    const updatedLocationDetails = { ...userLocationDetails, cep: value }
    setUserLocationDetails(updatedLocationDetails)
    setCepError("")

    // Auto-fill address when CEP has 8 digits
    if (value.replace(/\D/g, "").length === 8) {
      const addressData = await validateCep(value)
      if (addressData) {
        const fullLocationDetails = {
          ...updatedLocationDetails,
          street: addressData.street,
          neighborhood: addressData.neighborhood,
          city: addressData.city,
          detected: true, // Mark as detected to show location message
          rua: addressData.street,
          bairro: addressData.neighborhood,
        }
        setUserLocationDetails(fullLocationDetails)

        setTimeout(() => {
          const numberInput = document.querySelector('input[placeholder="Ex: 1578"]') as HTMLInputElement
          if (numberInput) {
            numberInput.focus()
          }
        }, 100)
      }
    }
  }

  const brazilianCities = [
    "São Paulo",
    "Rio de Janeiro",
    "Brasília",
    "Salvador",
    "Fortaleza",
    "Belo Horizonte",
    "Manaus",
    "Curitiba",
    "Recife",
    "Goiânia",
    "Belém",
    "Porto Alegre",
    "Guarulhos",
    "Campinas",
    "São Luís",
    "São Gonçalo",
    "Maceió",
    "Duque de Caxias",
    "Natal",
    "Teresina",
    "Campo Grande",
    "Nova Iguaçu",
    "São Bernardo do Campo",
    "João Pessoa",
    "Santo André",
    "Osasco",
    "Jaboatão dos Guararapes",
    "São José dos Campos",
    "Ribeirão Preto",
    "Uberlândia",
    "Sorocaba",
    "Contagem",
    "Aracaju",
    "Feira de Santana",
    "Cuiabá",
    "Joinville",
    "Juiz de Fora",
    "Londrina",
    "Aparecida de Goiânia",
    "Niterói",
    "Ananindeua",
    "Porto Velho",
    "Serra",
    "Caxias do Sul",
    "Vila Velha",
    "Florianópolis",
    "Macapá",
    "Campos dos Goytacazes",
    "São José do Rio Preto",
    "Mauá",
    "Carapicuíba",
    "Olinda",
    "Betim",
    "Diadema",
    "Jundiaí",
    "Piracicaba",
    "Cariacica",
    "Bauru",
    "Montes Claros",
    "Anápolis",
    "Taubaté",
    "Caucaia",
    "Vitória",
    "São Vicente",
    "Pelotas",
    "Canoas",
    "Franca",
    "Maringá",
    "Paulista",
    "Ponta Grossa",
    "Blumenau",
    "Limeira",
    "Suzano",
    "Petrolina",
    "Cascavel",
    "Volta Redonda",
    "Praia Grande",
    "Santa Maria",
    "Governador Valadares",
    "Taubate",
    "Uberaba",
    "Petrópolis",
    "Santarém",
    "Sete Lagoas",
    "Novo Hamburgo",
    "Presidente Prudente",
    "Mossoró",
    "Taboão da Serra",
    "São José dos Pinhais",
    "Caruaru",
    "Magé",
    "Dourados",
    "Juazeiro do Norte",
    "Marília",
    "São Carlos",
    "Sumaré",
    "Gravataí",
    "Viamão",
    "Embu das Artes",
    "Ribeirão das Neves",
    "Rio Branco",
    "Barueri",
    "Boa Vista",
    "Itaquaquecetuba",
    "Criciúma",
    "Juazeiro",
    "Americana",
    "Araraquara",
    "Jacareí",
    "Itabuna",
    "Cotia",
    "Chapecó",
    "Franco da Rocha",
    "Guarujá",
    "Indaiatuba",
    "São Leopoldo",
    "Hortolândia",
    "Itu",
    "Palmas",
    "Cabo Frio",
    "Foz do Iguaçu",
    "Angra dos Reis",
    "Macaé",
    "Itajaí",
    "Marabá",
    "Parauapebas",
    "Imperatriz",
    "Arapiraca",
    "Várzea Grande",
    "Rondonópolis",
    "Sobral",
    "Blumenau",
    "Caxias",
    "Itapevi",
    "Santana de Parnaíba",
    "Passo Fundo",
    "Ferraz de Vasconcelos",
    "Poá",
    "Bragança Paulista",
    "Atibaia",
    "Guaratinguetá",
    "Votorantim",
    "Botucatu",
    "Araçatuba",
    "São João de Meriti",
    "Nilópolis",
    "Nova Friburgo",
    "Resende",
    "Cabo de Santo Agostinho",
    "Garanhuns",
    "Vitória de Santo Antão",
    "Ipatinga",
    "Conselheiro Lafaiete",
    "Barbacena",
    "Varginha",
    "Poços de Caldas",
    "Passos",
    "Divinópolis",
    "Araguaína",
    "Gurupi",
    "Ji-Paraná",
    "Vilhena",
    "Cruzeiro do Sul",
    "Tefé",
    "Parintins",
    "Itacoatiara",
    "Manacapuru",
    "Coari",
    "Tabatinga",
    "Humaitá",
    "Lábrea",
    "Eirunepé",
    "São Gabriel da Cachoeira",
    "Barcelos",
    "Santa Isabel do Rio Negro",
    "Novo Airão",
    "Presidente Figueiredo",
  ]

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/ç/g, "c") // Replace ç with c
      .trim()
  }

  const handleCitySearch = (searchTerm: string) => {
    setUserLocation(searchTerm)

    if (searchTerm.length >= 1) {
      // Start searching from first character
      const normalizedSearch = normalizeText(searchTerm)

      const cityMatches = brazilianCities.map((city) => {
        const normalizedCity = normalizeText(city)
        let score = 0

        // Exact match gets highest score
        if (normalizedCity === normalizedSearch) {
          score = 100
        }
        // Starts with search term gets high score
        else if (normalizedCity.startsWith(normalizedSearch)) {
          score = 90
        }
        // Contains search term gets medium score
        else if (normalizedCity.includes(normalizedSearch)) {
          score = 70
        }
        // Fuzzy matching for typos
        else {
          const searchChars = normalizedSearch.split("")
          const cityChars = normalizedCity.split("")
          let matches = 0

          searchChars.forEach((char) => {
            if (cityChars.includes(char)) matches++
          })

          const matchPercentage = matches / searchChars.length
          if (matchPercentage >= 0.6) {
            // Lowered threshold for better fuzzy matching
            score = Math.floor(matchPercentage * 50)
          }
        }

        return { city, score }
      })

      const filteredAndSorted = cityMatches
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10) // Show max 10 results
        .map((item) => item.city)

      setCitySearchResults(filteredAndSorted)
      setShowCityResults(true)
    } else {
      setCitySearchResults([])
      setShowCityResults(false)
    }
  }

  const handleCitySelect = (city: string) => {
    setUserLocation(city)
    setUserLocationDetails((prev) => ({ ...prev, city }))
    setShowCityResults(false)
  }

  const mainMenuItems = [
    {
      id: 1,
      name: "Mini Box: Com Carnes Suculentas",
      description: "360G De Fritas E 3 Latas De Coca-Cola",
      checkoutDescription: "Mini Box Com Carnes Suculentas, 360G De Fritas E 3 Latas De Coca-Cola",
      price: "R$ 42,90",
      originalPrice: "R$ 92,00",
      discountPrice: "R$ 42,90",
      image: "/mini-box-combo.png",
    },
    {
      id: 2,
      name: "Combo Com 4 Hambúrgueres Saborosos",
      description: "500G De Fritas, 8 Nuggets E 2L De Coca-Cola",
      checkoutDescription:
        "4 Hambúrgueres Mesclados Entre Pão Americano E Brioche, Com Alface, Cebola Caramelizada, Catupiry, Queijo Cheddar, Tomate",
      price: "R$ 57,90",
      originalPrice: "R$ 129,00",
      discountPrice: "R$ 57,90",
      image: "/combo-4-hamburgueres-correct.png",
    },
    {
      id: 3,
      name: "Combo Completo: 6X Hambúrgueres",
      description: "500G De Fritas, 10 Nuggets E 2 Litros De Coca-Cola",
      checkoutDescription:
        "6 Hambúrgueres Mesclados Entre Pão Americano E Brioche, Com Cheddar Cremoso, Cream Cheese, Catupiry, Alface, Tomate E Bacon Em Bits",
      price: "R$ 67,90",
      originalPrice: "R$ 149,00",
      discountPrice: "R$ 67,90",
      image: "/combo-6x-hamburgueres-correct.jpeg",
    },
  ]

  const additionalMenuItems = [
    {
      id: 4,
      name: "Combo Burgl Bacon, Duplo Cheddar",
      description: "120G De Fritas E 1 Lata De Coca-Cola.",
      price: "R$ 24,90",
      originalPrice: "R$ 32,90",
      discountPrice: "R$ 19,90",
      image: "/combo-burgl-bacon-duplo-cheddar.png",
    },
    {
      id: 5,
      name: "Combo Classic Burgl: 2 Carnes Suculentas",
      description: "120G De Fritas E 1 Lata De Coca-Cola",
      price: "R$ 22,90",
      originalPrice: "R$ 29,90",
      discountPrice: "R$ 17,90",
      image: "/combo-classic-burgl-2-carnes.png",
    },
    {
      id: 6,
      name: "Burgl Charque",
      description: "170G De Carne Suculenta, Duplo Cheddar E Cream Cheese.",
      price: "R$ 26,90",
      originalPrice: "R$ 34,90",
      discountPrice: "R$ 21,90",
      image: "/burgl-charque.png",
    },
    {
      id: 7,
      name: "Burgl Salada",
      description: "Alface Americana Crocante, Tomate, Cheddar.",
      price: "R$ 25,90",
      originalPrice: "R$ 33,90",
      discountPrice: "R$ 20,90",
      image: "/salad-burger.png",
    },
    {
      id: 8,
      name: "Burgl Catubacon",
      description: "170G De Carne Suculenta, Cheddar e Catupiry.",
      price: "R$ 27,90",
      originalPrice: "R$ 35,90",
      discountPrice: "R$ 22,90",
      image: "/catubacon-burger.png",
    },
  ]

  const drinksMenuItems = [
    {
      id: 9,
      name: "Pepsi Litro",
      description: "Refrigerante Pepsi gelado de 1 litro",
      price: "R$ 10,90",
      originalPrice: "R$ 10,90",
      discountPrice: "R$ 7,00",
      image: "/pepsi-litro-correct.png",
    },
    {
      id: 10,
      name: "Coca-Cola Original Litro",
      description: "Refrigerante Coca-Cola tradicional de 1 litro",
      price: "R$ 14,90",
      originalPrice: "R$ 14,90",
      discountPrice: "R$ 10,00",
      image: "/coca-cola-original-litro-correct.png",
    },
    {
      id: 11,
      name: "Guaraná Antártica Litro",
      description: "Refrigerante de guaraná gelado de 1 litro",
      price: "R$ 10,90",
      originalPrice: "R$ 10,90",
      discountPrice: "R$ 7,00",
      image: "/guarana-antarctica-litro-correct.png",
    },
    {
      id: 12,
      name: "Coca-Cola Zero 1 Litro",
      description: "Refrigerante Coca-Cola Zero açúcar de 1 litro",
      price: "R$ 10,90",
      originalPrice: "R$ 10,90",
      discountPrice: "R$ 7,00",
      image: "/coca-cola-zero-litro-correct.png",
    },
  ]

  const [initialDesserts, setInitialDesserts] = useState([
    {
      id: 13,
      name: "Brownie de Chocolate",
      description: "Delicioso brownie de chocolate com nozes",
      price: "R$ 12,90",
      originalPrice: "R$ 15,90",
      discountPrice: "R$ 12,90",
      image: "/brownie-chocolate.jpg",
    },
    {
      id: 14,
      name: "Sorvete de Baunilha",
      description: "Sorvete cremoso de baunilha com calda",
      price: "R$ 8,90",
      originalPrice: "R$ 10,90",
      discountPrice: "R$ 8,90",
      image: "/vanilla-ice-cream.png",
    },
    {
      id: 15,
      name: "Pudim de Leite",
      description: "Pudim caseiro de leite condensado",
      price: "R$ 9,90",
      originalPrice: "R$ 12,90",
      discountPrice: "R$ 9,90",
      image: "/milk-pudding.jpg",
    },
  ])

  const [itemQuantity, setItemQuantity] = useState(1)
  const [selectedBatata, setSelectedBatata] = useState("")
  const [selectedRefrigerante, setSelectedRefrigerante] = useState("")
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [itemComments, setItemComments] = useState("")

  const extrasCategories = [
    {
      title: "Porções extras",
      items: [
        { name: "Batata Extra (pequena)", price: 6.9 },
        { name: "Onion Rings (6 unid.)", price: 8.9 },
        { name: "Nuggets (6 unid.)", price: 9.9 },
      ],
    },
    {
      title: "Queijos e molhos",
      items: [
        { name: "Queijo Extra (cheddar, prato ou muçarela)", price: 3.9 },
        { name: "Molho da Burgl Especial", price: 2.5 },
        { name: "Molho Barbecue ou Mostarda e Mel", price: 2.5 },
      ],
    },
  ]

  const availableExtras = extrasCategories.flatMap((category) => category.items)

  const openItemPopup = (item: any) => {
    setSelectedItem(item)
    setItemQuantity(1)
    setSelectedBatata("")
    setSelectedRefrigerante("")
    setSelectedExtras([])
    setItemComments("")
    setShowItemPopup(true)
  }

  const closeItemPopup = () => {
    setShowItemPopup(false)
    setSelectedItem(null)
  }

  const toggleExtra = (extra: string) => {
    if (selectedExtras.includes(extra)) {
      setSelectedExtras(selectedExtras.filter((e) => e !== extra))
    } else {
      setSelectedExtras([...selectedExtras, extra])
    }
  }

  const getItemSubtotal = () => {
    if (!selectedItem) return 0
    const basePrice = Number.parseFloat(selectedItem.discountPrice.replace("R$ ", "").replace(",", "."))
    let extrasPrice = 0

    selectedExtras.forEach((extraName) => {
      const extra = availableExtras.find((e) => e.name === extraName)
      if (extra) {
        extrasPrice += extra.price
      }
    })

    return (basePrice + extrasPrice) * itemQuantity
  }

  const addToNewCart = () => {
    const isDessertOrDrink =
      drinksMenuItems.some((drink) => drink.id === selectedItem?.id) ||
      desserts.some((dessert) => dessert.id === selectedItem?.id) ||
      initialDesserts.some((dessert) => dessert.id === selectedItem?.id)

    if (!isDessertOrDrink && (!selectedBatata || !selectedRefrigerante)) {
      alert("Por favor, selecione uma opção de batata e refrigerante.")
      return
    }

    // Parse price correctly from discountPrice
    const priceString = selectedItem.discountPrice.replace("R$ ", "").replace(",", ".")
    const basePrice = Number.parseFloat(priceString)
    let extrasPrice = 0

    const extrasDetails = []
    selectedExtras.forEach((extraName) => {
      const extra = availableExtras.find((e) => e.name === extraName)
      if (extra) {
        extrasPrice += extra.price
        extrasDetails.push({
          name: extra.name,
          price: extra.price,
        })
      }
    })

    const unitPrice = basePrice + extrasPrice
    const totalPrice = unitPrice * itemQuantity

    const cartItem = {
      id: Date.now(),
      name: selectedItem.name,
      description: selectedItem.checkoutDescription,
      unitPrice: unitPrice,
      basePrice: basePrice,
      quantity: itemQuantity,
      totalPrice: totalPrice,
      batata: selectedBatata,
      refrigerante: selectedRefrigerante,
      extras: selectedExtras,
      extrasDetails: extrasDetails, // Detalhes dos extras com preços
      comments: itemComments,
      image: selectedItem.image,
      product_hash: `product_${selectedItem.id}`,
      itemDetails: {
        baseItem: {
          name: selectedItem.name,
          price: basePrice,
          description: selectedItem.checkoutDescription,
        },
        customizations: {
          batata: selectedBatata,
          refrigerante: selectedRefrigerante,
        },
        extras: extrasDetails,
        comments: itemComments,
      },
    }

    setNewCart([...newCart, cartItem])
    closeItemPopup()
    setShowNewCart(true)
  }

  const removeFromNewCart = (itemId: number) => {
    setNewCart(newCart.filter((item) => item.id !== itemId))
  }

  const updateNewCartItemQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromNewCart(itemId)
      return
    }

    setNewCart(
      newCart.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: item.unitPrice * newQuantity,
          }
        }
        return item
      }),
    )
  }

  const getNewCartTotal = () => {
    const subtotal = newCart.reduce((sum, item) => sum + item.totalPrice, 0)
    return subtotal
  }

  const handleCreditCardPaymentClick = () => {
    setShowCreditCardForm(true)
  }

  const handleMercadoPagoPaymentClick = () => {
    setShowDeliveryConfirmationPopup(true)
  }

  const handlePixPaymentClick = () => {
    setShowDeliveryConfirmationPopup(true)
  }

  const handleConfirmDelivery = () => {
    setShowDeliveryConfirmationPopup(false)
    setShowPixInstructionsPopup(true)
  }

  const handleMercadoPagoInstructionsConfirmed = async () => {
    setIsProcessingPix(true)

    try {
      await processPayment()
      setShowMercadoPagoInstructionsPopup(false)
      setIsProcessingPix(false)
    } catch (error) {
      setIsProcessingPix(false)
      setPaymentError("Erro ao processar pagamento. Tente novamente.")
    }
  }

  const handlePixInstructionsConfirmed = async () => {
    setIsProcessingPix(true)

    try {
      await processPayment()
      // Only close popup after payment is successfully processed
      setShowPixInstructionsPopup(false)
      setIsProcessingPix(false)
    } catch (error) {
      setIsProcessingPix(false)
      setPaymentError("Erro ao processar pagamento. Tente novamente.")
    }
  }

  const processPayment = async () => {
    setIsProcessingPayment(true)
    setPaymentError("")

    try {
      console.log("[v0] Processing payment with cart items:", newCart)

      const detailedItems = newCart.map((cartItem, index) => {
        const basePrice = cartItem.basePrice || 0
        const extrasPrice = cartItem.extras.reduce((sum, extra) => {
          const extraPrice = extraPrices[extra] || 0
          return sum + extraPrice
        }, 0)
        const unitPrice = basePrice + extrasPrice
        const totalPrice = unitPrice * cartItem.quantity

        return {
          name: cartItem.name,
          description: `${cartItem.description || cartItem.name}${cartItem.batata ? ` - ${cartItem.batata}` : ""}${cartItem.refrigerante ? ` - ${cartItem.refrigerante}` : ""}${cartItem.extras.length > 0 ? ` - Extras: ${cartItem.extras.join(", ")}` : ""}${cartItem.comments ? ` - Obs: ${cartItem.comments}` : ""}`,
          quantity: cartItem.quantity,
          unitPrice: unitPrice,
          totalPrice: totalPrice,
          basePrice: basePrice,
          extrasPrice: extrasPrice,
          external_id: `item_${index}_${cartItem.id}_${Date.now()}`,
          product_hash: cartItem.product_hash || `product_${cartItem.id}`,
          customizations: {
            batata: cartItem.batata || "",
            refrigerante: cartItem.refrigerante || "",
            extras: cartItem.extras || [],
            comments: cartItem.comments || "",
          },
        }
      })

      const total = getNewCartTotal()
      console.log("[v0] Cart total calculated:", total)

      const paymentPayload = {
        amount: total, // Será convertido para centavos na API route
        description: `Pedido Burger Delivery - ${newCart.length} item(ns)`,
        customer: {
          name: paymentFormData.name.trim(),
          cpf: paymentFormData.cpf.replace(/\D/g, ""), // Remove formatação do CPF
          email: paymentFormData.email,
          phone: paymentFormData.phone.replace(/\D/g, ""), // Remove formatação do telefone
        },
        items: detailedItems,
        metadata: {
          order_type: "delivery",
          restaurant: "Burger Delivery",
          timestamp: new Date().toISOString(),
          cart_hash: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
      }

      console.log("[v0] Sending payment payload to CinqPay:", {
        ...paymentPayload,
        customer: { ...paymentPayload.customer, cpf: "[HIDDEN]" },
      })

      const response = await fetch("/api/cinqpay/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      })

      const result = await response.json()
      console.log("[v0] CinqPay API response:", result)

      if (result.success && (result.qr_code || result.pix_code)) {
        const qrCodeValue = result.qr_code || result.pix_code
        const pixCodeValue = result.pix_code || result.qr_code

        // Gerar QR code como imagem se necessário
        let qrCodeImage = qrCodeValue
        if (qrCodeValue && !qrCodeValue.startsWith("data:") && !qrCodeValue.startsWith("http")) {
          // Se for apenas o código PIX, gerar QR code
          qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeValue)}`
        }

        setQrCodeData(qrCodeImage)
        setPixCode(pixCodeValue)
        setCheckoutStep("qrcode")

        console.log("[v0] Payment processed successfully:", {
          hasQrCode: !!qrCodeImage,
          hasPixCode: !!pixCodeValue,
          transactionHash: result.transaction_hash,
        })

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "last_transaction",
            JSON.stringify({
              hash: result.transaction_hash,
              amount: total,
              timestamp: new Date().toISOString(),
              items: detailedItems.length,
            }),
          )
        }
      } else {
        const errorMessage = result.error || "Erro ao processar pagamento. Tente novamente."
        console.error("[v0] Payment failed:", errorMessage)
        setPaymentError(errorMessage)
        alert(errorMessage)
      }
    } catch (error) {
      console.error("[v0] Payment processing error:", error)
      const errorMessage = "Erro de conexão. Verifique sua internet e tente novamente."
      setPaymentError(errorMessage)
      alert(errorMessage)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const copyPixCodeToClipboard = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode)
      alert("Código PIX copiado!")
    }
  }

  const addToCart = () => {
    if (!selectedBatata || !selectedRefrigerante) {
      alert("Por favor, selecione uma opção de batata e refrigerante.")
      return
    }

    const basePrice = Number.parseFloat(selectedItem.discountPrice.replace("R$ ", "").replace(",", "."))
    let extrasPrice = 0

    selectedExtras.forEach((extra) => {
      if (extra === "3 Molhos Especial") extrasPrice += 9.0
      if (extra === "Sachês Extras") extrasPrice += 2.0
    })

    const itemTotal = (basePrice + extrasPrice) * itemQuantity

    const cartItem = {
      id: Date.now(),
      item: selectedItem,
      quantity: itemQuantity,
      batata: selectedBatata,
      refrigerante: selectedRefrigerante,
      extras: selectedExtras,
      comments: itemComments,
      total: itemTotal,
      name: selectedItem.name,
      selectedBatata: selectedBatata,
      selectedRefrigerante: selectedRefrigerante,
      selectedExtras: selectedExtras,
    }

    setCart([...cart, cartItem])
    closeItemPopup()
    setShowCart(true)
  }

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter((item) => item.id !== itemId))
  }

  const updateCartItemQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(itemId)
      return
    }

    setCart(
      cart.map((item) => {
        if (item.id === itemId) {
          const basePrice = Number.parseFloat(item.item.discountPrice.replace("R$ ", "").replace(",", "."))
          let extrasPrice = 0
          item.extras.forEach((extra: string) => {
            if (extra === "3 Molhos Especial") extrasPrice += 9.0
            if (extra === "Sachês Extras") extrasPrice += 2.0
          })
          return {
            ...item,
            quantity: newQuantity,
            total: (basePrice + extrasPrice) * newQuantity,
          }
        }
        return item
      }),
    )
  }

  const getCartTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
    // Remove freight calculation - payment amount equals subtotal
    return { subtotal, freight: 0, total: subtotal }
  }

  const renderMenuItem = (item: any, isMainMenu = false) => (
    <Card
      key={item.id}
      className={`overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200 bg-white border-0 rounded-xl ${
        isMainMenu ? "ring-1 ring-red-100" : ""
      }`}
      onClick={() => openItemPopup(item)}
    >
      <div className="flex p-3">
        <div className="flex-1 pr-3">
          <h3 className="font-semibold text-base mb-1 text-gray-900 leading-tight">{item.name}</h3>
          <p className="text-sm text-gray-800 mb-3 leading-relaxed">{item.description}</p>
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              {item.originalPrice && (
                <span className="text-xs text-gray-600 line-through mb-1">
                  R$ {item.originalPrice.replace("R$ ", "")}
                </span>
              )}
              <span className="text-lg font-bold text-gray-900">{item.price}</span>
            </div>
            <button className="bg-white border border-red-500 text-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-50 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
        </div>
      </div>
    </Card>
  )

  const [showLocationModal, setShowLocationModal] = useState(false)

  const proceedToCheckout = () => {
    setShowNewCart(false)
    setShowCheckoutFlow(true)
    setCheckoutStep("delivery")
  }

  const extraPrices: { [key: string]: number } = {
    "3 Molhos Especial": 9.0,
    "Sachês Extras": 2.0,
    "Bacon Extra": 5.0,
    "Queijo Extra": 4.0,
    "Cebola Caramelizada": 3.0,
    "Picles Extra": 2.5,
  }

  const [burgers, setBurgers] = useState([
    {
      id: 4,
      name: "Combo Burgl Bacon, Duplo Cheddar",
      description: "120G De Fritas E 1 Lata De Coca-Cola.",
      price: "R$ 19,90",
      originalPrice: "R$ 32,90",
      discountPrice: "R$ 19,90",
      image: "/combo-burgl-bacon-duplo-cheddar.png",
    },
    {
      id: 5,
      name: "Combo Classic Burgl: 2 Carnes Suculentas",
      description: "120G De Fritas E 1 Lata De Coca-Cola",
      price: "R$ 17,90",
      originalPrice: "R$ 29,90",
      discountPrice: "R$ 17,90",
      image: "/combo-classic-burgl-2-carnes.png",
    },
    {
      id: 6,
      name: "Burgl Charque",
      description: "170G De Carne Suculenta, Duplo Cheddar E Cream Cheese.",
      price: "R$ 21,90",
      originalPrice: "R$ 34,90",
      discountPrice: "R$ 21,90",
      image: "/burgl-charque.png",
    },
    {
      id: 7,
      name: "Burgl Salada",
      description: "Alface Americana Crocante, Tomate, Cheddar.",
      price: "R$ 20,90",
      originalPrice: "R$ 33,90",
      discountPrice: "R$ 20,90",
      image: "/salad-burger.png",
    },
    {
      id: 8,
      name: "Burgl Catubacon",
      description: "170G De Carne Suculenta, Cheddar e Catupiry.",
      price: "R$ 22,90",
      originalPrice: "R$ 35,90",
      discountPrice: "R$ 22,90",
      image: "/catubacon-burger.png",
    },
  ])

  const [combos, setCombos] = useState([
    {
      id: 1,
      name: "Mini Box: Com Carnes Suculentas",
      description: "360G De Fritas E 3 Latas De Coca-Cola",
      checkoutDescription: "Mini Box Com Carnes Suculentas, 360G De Fritas E 3 Latas De Coca-Cola",
      price: "R$ 42,90",
      originalPrice: "R$ 59,00",
      discountPrice: "R$ 42,90",
      image: "/mini-box-combo.png",
    },
    {
      id: 2,
      name: "Combo Com 4 Hambúrgueres Saborosos",
      description: "500G De Fritas, 8 Nuggets E 2L De Coca-Cola",
      checkoutDescription:
        "4 Hambúrgueres Mesclados Entre Pão Americano E Brioche, Com Alface, Cebola Caramelizada, Catupiry, Queijo Cheddar, Tomate",
      price: "R$ 57,90",
      originalPrice: "R$ 119,00",
      discountPrice: "R$ 57,90",
      image: "/combo-4-hamburgueres-correct.png",
    },
    {
      id: 3,
      name: "Combo Completo: 6X Hambúrgueres",
      description: "500G De Fritas, 10 Nuggets E 2 Litros De Coca-Cola",
      checkoutDescription:
        "6 Hambúrgueres Mesclados Entre Pão Americano E Brioche, Com Cheddar Cremoso, Cream Cheese, Catupiry, Alface, Tomate E Bacon Em Bits",
      price: "R$ 67,90",
      originalPrice: "R$ 149,00",
      discountPrice: "R$ 67,90",
      image: "/combo-6x-hamburgueres-correct.jpeg",
    },
  ])

  const [bebidas, setBebidas] = useState([
    {
      id: 9,
      name: "Pepsi Litro",
      description: "Refrigerante Pepsi gelado de 1 litro",
      price: "R$ 10,90",
      originalPrice: "R$ 10,90",
      discountPrice: "R$ 7,00",
      image: "/pepsi-litro-correct.png",
    },
    {
      id: 10,
      name: "Coca-Cola Original Litro",
      description: "Refrigerante Coca-Cola tradicional de 1 litro",
      price: "R$ 14,90",
      originalPrice: "R$ 14,90",
      discountPrice: "R$ 10,00",
      image: "/coca-cola-original-litro-correct.png",
    },
    {
      id: 11,
      name: "Guaraná Antártica Litro",
      description: "Refrigerante Coca-Cola Zero açúcar de 1 litro",
      price: "R$ 10,90",
      originalPrice: "R$ 10,90",
      discountPrice: "R$ 7,00",
      image: "/guarana-antarctica-litro-correct.png",
    },
    {
      id: 12,
      name: "Coca-Cola Zero 1 Litro",
      description: "Refrigerante Coca-Cola Zero açúcar de 1 litro",
      price: "R$ 10,90",
      originalPrice: "R$ 10,90",
      discountPrice: "R$ 7,00",
      image: "/coca-cola-zero-litro-correct.png",
    },
  ])

  const [desserts, setDesserts] = useState([
    {
      id: 13,
      name: "Brownie de Chocolate",
      description: "Delicioso brownie de chocolate com nozes",
      price: "R$ 12,90",
      originalPrice: "R$ 15,90",
      discountPrice: "R$ 12,90",
      image: "/brownie-chocolate.jpg",
    },
    {
      id: 14,
      name: "Sorvete de Baunilha",
      description: "Sorvete cremoso de baunilha com calda",
      price: "R$ 8,90",
      originalPrice: "R$ 10,90",
      discountPrice: "R$ 8,90",
      image: "/vanilla-ice-cream.png",
    },
    {
      id: 15,
      name: "Pudim de Leite",
      description: "Pudim caseiro de leite condensado",
      price: "R$ 9,90",
      originalPrice: "R$ 12,90",
      discountPrice: "R$ 9,90",
      image: "/milk-pudding.jpg",
    },
  ])

  const formatCPF = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")

    // Limit to 11 digits
    const limitedDigits = digits.slice(0, 11)

    // Apply CPF mask: 000.000.000-00
    if (limitedDigits.length <= 3) {
      return limitedDigits
    } else if (limitedDigits.length <= 6) {
      return `${limitedDigits.slice(0, 3)}.${limitedDigits.slice(3)}`
    } else if (limitedDigits.length <= 9) {
      return `${limitedDigits.slice(0, 3)}.${limitedDigits.slice(3, 6)}.${limitedDigits.slice(6)}`
    } else {
      return `${limitedDigits.slice(0, 3)}.${limitedDigits.slice(3, 6)}.${limitedDigits.slice(6, 9)}-${limitedDigits.slice(9)}`
    }
  }

  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [showOrderSummary, setShowOrderSummary] = useState(false)

  const cartItems = [
    {
      name: "Mini Box: Com Carnes Suculentas",
      quantity: 1,
      price: 42.9,
      selectedOptions: ["Batata Crinkle", "Coca-Cola"],
    },
    {
      name: "Combo Com 4 Hambúrgueres",
      quantity: 1,
      price: 57.9,
      selectedOptions: ["Batata Rústica", "Guaraná Antarctica"],
    },
  ]

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const [pixCodeCopied, setPixCodeCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes in seconds

  useEffect(() => {
    if (checkoutStep === "qrcode" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [checkoutStep, timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const progressPercentage = (timeLeft / (15 * 60)) * 100

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const deliveryFee = 7.0
  const totalPrice = subtotal + deliveryFee

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const allItems = [...mainMenuItems, ...burgers, ...combos, ...drinksMenuItems, ...bebidas, ...desserts]
    const filtered = allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()),
    )
    setSearchResults(filtered)
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "search":
        return (
          <div className="px-4 py-6 pb-24">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {searchQuery && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {searchResults.length} resultado(s) para "{searchQuery}"
                </p>
              </div>
            )}

            <div className="space-y-3">
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openItemPopup(item)}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1 text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-800 mb-2 leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-2">
                      {item.originalPrice && (
                        <span className="text-xs text-muted line-through">{item.originalPrice}</span>
                      )}
                      <span className="font-bold text-foreground text-lg">{item.discountPrice || item.price}</span>
                    </div>
                  </div>
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full bg-primary hover:bg-primary/90 shadow-lg flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {searchQuery && searchResults.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-600">Tente buscar por outro termo</p>
              </div>
            )}
          </div>
        )

      case "orders":
        return (
          <div className="px-4 py-6 pb-24">
            <h2 className="text-xl font-bold mb-6 text-foreground">Meus Pedidos</h2>

            {orderHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Você ainda não fez nenhum pedido</h3>
                <p className="text-gray-600 mb-6">Que tal experimentar nossos deliciosos hambúrgueres?</p>
                <Button
                  onClick={() => setCurrentView("home")}
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium"
                >
                  Fazer pedido agora
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orderHistory.map((order, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">Pedido #{order.id}</h3>
                        <p className="text-sm text-gray-600">{order.date}</p>
                      </div>
                      <span className="text-sm font-medium text-green-600">{order.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{order.items}</p>
                    <p className="font-bold text-primary">{order.total}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      default: // home
        return (
          <div className="pb-24">
            {/* Restaurant Info Section */}
            <div className="bg-white p-4">
              {/* Logo and Name */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src="/burgl-delivery-logo-square.png"
                    alt="Burgl Delivery Logo"
                    className="w-20 h-16 object-contain rounded-xl shadow-sm"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Burgl Delivery</h1>
                    <p className="text-gray-600 text-sm">Hambúrgueres Artesanais</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Status Cards */}
              <div className="space-y-3">
                {/* Open Status */}
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium text-sm">ABERTO</span>
                  </div>
                </div>

                {/* Rating and Delivery Info */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                        <span className="font-semibold text-gray-900">4.9</span>
                        <span className="text-gray-600 text-sm">{""}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>35-40 min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bike className="w-4 h-4" />
                        <span>R$ 7,00</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Minimum Order */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">Pedido Mínimo</span>
                      <div className="text-sm text-gray-700">Entrega grátis acima de R$ 30</div>
                    </div>
                    <span className="text-gray-900 font-bold">R$ 10,00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Menu Items */}
            <div className="px-4 py-6">
              <h2 className="text-xl font-bold mb-4 text-foreground">Pedidos com entrega grátis</h2>
              <div className="space-y-3">
                {mainMenuItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-4 bg-white rounded-lg shadow-sm border-2 border-green-500 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openItemPopup(item)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1 text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-800 mb-2 leading-relaxed">{item.description}</p>
                      <div className="flex items-center gap-2">
                        {item.originalPrice && (
                          <span className="text-xs text-muted line-through">{item.originalPrice}</span>
                        )}
                        <span className="font-bold text-foreground text-lg">{item.discountPrice || item.price}</span>
                      </div>
                    </div>
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full bg-primary hover:bg-primary/90 shadow-lg flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Menu Sections */}
            <div className="px-4 py-6">
              <h2 className="text-xl font-bold mb-4 text-foreground">Hambúrgueres</h2>
              <div className="space-y-3">
                {burgers.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openItemPopup(item)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1 text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-800 mb-2 leading-relaxed">{item.description}</p>
                      <div className="flex items-center gap-2">
                        {item.originalPrice && (
                          <span className="text-xs text-muted line-through">{item.originalPrice}</span>
                        )}
                        <span className="font-bold text-foreground text-lg">{item.discountPrice || item.price}</span>
                      </div>
                    </div>
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full bg-primary hover:bg-primary/90 shadow-lg flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Combos Section */}
            <div className="px-4 py-6">
              <h2 className="text-xl font-bold mb-4 text-foreground">Combos</h2>
              <div className="space-y-3">
                {combos.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openItemPopup(item)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1 text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-800 mb-2 leading-relaxed">{item.description}</p>
                      <div className="flex items-center gap-2">
                        {item.originalPrice && (
                          <span className="text-xs text-muted line-through">{item.originalPrice}</span>
                        )}
                        <span className="font-bold text-foreground text-lg">{item.discountPrice || item.price}</span>
                      </div>
                    </div>
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full bg-primary hover:bg-primary/90 shadow-lg flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drinks Section */}
            <div className="px-4 py-6">
              <h2 className="text-xl font-bold mb-4 text-foreground">Bebidas</h2>
              <div className="space-y-3">
                {drinksMenuItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openItemPopup(item)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1 text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-800 mb-2 leading-relaxed">{item.description}</p>
                      <div className="flex items-center gap-2">
                        {item.originalPrice && (
                          <span className="text-xs text-muted line-through">{item.originalPrice}</span>
                        )}
                        <span className="font-bold text-foreground text-lg">{item.discountPrice || item.price}</span>
                      </div>
                    </div>
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full bg-primary hover:bg-primary/90 shadow-lg flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desserts Section */}
            <div className="px-4 py-6">
              <h2 className="text-xl font-bold mb-4 text-foreground">Sobremesas</h2>
              <div className="space-y-3">
                {desserts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openItemPopup(item)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1 text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-800 mb-2 leading-relaxed">{item.description}</p>
                      <div className="flex items-center gap-2">
                        {item.originalPrice && (
                          <span className="text-xs text-muted line-through">{item.originalPrice}</span>
                        )}
                        <span className="font-bold text-foreground text-lg">{item.discountPrice || item.price}</span>
                      </div>
                    </div>
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full bg-primary hover:bg-primary/90 shadow-lg flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
    }
  }

  const processCinqPayPayment = async () => {
    setIsProcessingPayment(true)
    setPaymentError("")

    try {
      console.log("[v0] Processing credit card payment with cart items:", newCart)

      const detailedItems = newCart.map((cartItem, index) => {
        const basePrice = cartItem.basePrice || 0
        const extrasPrice = cartItem.extras.reduce((sum, extra) => {
          const extraPrice = extraPrices[extra] || 0
          return sum + extraPrice
        }, 0)
        const unitPrice = basePrice + extrasPrice
        const totalPrice = unitPrice * cartItem.quantity

        return {
          name: cartItem.name,
          description: `${cartItem.description || cartItem.name}${cartItem.batata ? ` - ${cartItem.batata}` : ""}${cartItem.refrigerante ? ` - ${cartItem.refrigerante}` : ""}${cartItem.extras.length > 0 ? ` - Extras: ${cartItem.extras.join(", ")}` : ""}${cartItem.comments ? ` - Obs: ${cartItem.comments}` : ""}`,
          quantity: cartItem.quantity,
          unitPrice: unitPrice,
          totalPrice: totalPrice,
          basePrice: basePrice,
          extrasPrice: extrasPrice,
          external_id: `item_${index}_${cartItem.id}_${Date.now()}`,
          product_hash: cartItem.product_hash || `product_${cartItem.id}`,
        }
      })

      const total = getNewCartTotal()
      console.log("[v0] Cart total calculated:", total)

      const paymentPayload = {
        amount: total,
        description: `Pedido Burger Delivery - ${newCart.length} item(ns)`,
        payment_method: "credit_card", // Set payment method to credit card
        customer: {
          name: paymentFormData.name.trim(),
          cpf: paymentFormData.cpf.replace(/\D/g, ""),
          email: paymentFormData.email,
          phone: paymentFormData.phone.replace(/\D/g, ""),
        },
        card_data: {
          number: creditCardData.cardNumber.replace(/\s/g, ""),
          expiry_date: creditCardData.expiryDate,
          cvv: creditCardData.cvv,
          holder_name: creditCardData.cardholderName,
        },
        items: detailedItems,
        metadata: {
          order_type: "delivery",
          restaurant: "Burger Delivery",
          timestamp: new Date().toISOString(),
          cart_hash: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
      }

      console.log("[v0] Sending credit card payment payload to CinqPay:", {
        ...paymentPayload,
        customer: { ...paymentPayload.customer, cpf: "[HIDDEN]" },
        card_data: { ...paymentPayload.card_data, number: "[HIDDEN]", cvv: "[HIDDEN]" },
      })

      const response = await fetch("/api/cinqpay/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      })

      const result = await response.json()
      console.log("[v0] CinqPay credit card API response:", result)

      if (result.success) {
        console.log("[v0] Credit card payment processed successfully:", {
          transactionHash: result.transaction_hash,
          paymentId: result.payment_id,
          status: result.status,
        })

        alert("Pagamento com cartão de crédito realizado com sucesso!")
        setShowCreditCardForm(false)

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "last_transaction",
            JSON.stringify({
              hash: result.transaction_hash,
              amount: total,
              timestamp: new Date().toISOString(),
              items: detailedItems.length,
              payment_method: "credit_card",
            }),
          )
        }

        setNewCart([])
        setCheckoutStep("cart") // Assuming 'cart' is a valid step or needs to be handled
      } else {
        const errorMessage = result.error || "Erro ao processar pagamento com cartão de crédito. Tente novamente."
        console.error("[v0] Credit card payment failed:", errorMessage)
        setPaymentError(errorMessage)
        alert(errorMessage)
      }
    } catch (error) {
      console.error("[v0] Credit card payment processing error:", error)
      const errorMessage = "Erro de conexão. Verifique sua internet e tente novamente."
      setPaymentError(errorMessage)
      alert(errorMessage)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  })

  const handlePixPayment = async () => {
    if (!customerData.name || !customerData.cpf) {
      alert("Por favor, preencha nome e CPF para continuar com o pagamento PIX.")
      return
    }

    setIsProcessingPayment(true)
    setPaymentError(null)

    try {
      const detailedItems = cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      }))

      const paymentPayload = {
        amount: getNewCartTotal(),
        description: `Pedido Burger Delivery - ${detailedItems.length} itens`,
        customer: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          cpf: customerData.cpf,
          address: customerData.address,
          number: customerData.number,
          complement: customerData.complement,
          neighborhood: customerData.neighborhood,
          city: customerData.city,
          state: customerData.state,
          zipCode: customerData.zipCode,
        },
        items: detailedItems,
        metadata: {
          order_id: `order_${Date.now()}`,
          cart_hash: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
      }

      console.log("[v0] Sending payment payload to CinqPay:", {
        ...paymentPayload,
        customer: { ...paymentPayload.customer, cpf: "[HIDDEN]" },
      })

      const response = await fetch("/api/cinqpay/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      })

      const result = await response.json()
      console.log("[v0] CinqPay API response:", result)

      if (result.success && (result.qr_code || result.pix_code)) {
        const qrCodeValue = result.qr_code || result.pix_code
        const pixCodeValue = result.pix_code || result.qr_code

        let qrCodeImage = qrCodeValue
        if (qrCodeValue && !qrCodeValue.startsWith("data:") && !qrCodeValue.startsWith("http")) {
          // Se for apenas o código PIX, gerar QR code usando serviço externo
          qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeValue)}`
        }

        setQrCodeData(qrCodeImage)
        setPixCode(pixCodeValue)
        setCheckoutStep("qrcode")

        console.log("[v0] Payment processed successfully:", {
          hasQrCode: !!qrCodeImage,
          hasPixCode: !!pixCodeValue,
          transactionHash: result.transaction_hash,
        })

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "last_transaction",
            JSON.stringify({
              hash: result.transaction_hash,
              amount: getNewCartTotal(),
              timestamp: new Date().toISOString(),
              items: detailedItems.length,
            }),
          )
        }
      } else {
        const errorMessage = result.error || "Erro desconhecido ao processar pagamento"
        console.error("[v0] Payment failed:", result)
        setPaymentError(errorMessage)

        // Se houver dados de debug, mostrar no console
        if (result.debug || result.details) {
          console.error("[v0] Debug info:", result.debug || result.details)
        }
      }
    } catch (error) {
      console.error("[v0] Payment request failed:", error)
      setPaymentError("Erro de conexão. Verifique sua internet e tente novamente.")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {renderCurrentView()}

      {/* Reviews Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Reviews Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-500 text-lg">
                    ★
                  </span>
                ))}
              </div>
              <span className="text-lg font-bold text-gray-900">4.9</span>
              <span className="text-sm text-gray-600">(528+ avaliações)</span>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {/* Visible Reviews */}
            <div className="border-b border-gray-100 pb-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  M
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">Maria Silva</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-amber-500 text-xs">
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    Pedido chegou rapidinho e o hambúrguer estava delicioso! Carne no ponto certo e ingredientes
                    frescos.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-100 pb-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  J
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">João Santos</span>
                    <div className="flex">
                      {[...Array(4)].map((_, i) => (
                        <span key={i} className="text-amber-500 text-xs">
                          ★
                        </span>
                      ))}
                      <span className="text-gray-300 text-xs">★</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">Muito bom! Entrega rápida e embalagem caprichada.</p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-100 pb-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  A
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">Ana Costa</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-amber-500 text-xs">
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden Reviews with fade effect */}
            <div className={`relative ${showAllReviews ? "block" : "block"}`}>
              <div className={`space-y-4 ${showAllReviews ? "opacity-100" : "opacity-30"}`}>
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      C
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">Carlos Oliveira</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-amber-500 text-xs">
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        Hambúrguer sensacional! Ingredientes de qualidade e sabor incrível.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      L
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">Lucia Ferreira</span>
                        <div className="flex">
                          {[...Array(4)].map((_, i) => (
                            <span key={i} className="text-amber-500 text-xs">
                              ★
                            </span>
                          ))}
                          <span className="text-gray-300 text-xs">★</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">Ótimo atendimento e comida saborosa!</p>
                    </div>
                  </div>
                </div>

                {showAllReviews && (
                  <>
                    <div className="border-b border-gray-100 pb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          R
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">Roberto Lima</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className="text-amber-500 text-xs">
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">Melhor hambúrguer da região! Sempre peço aqui.</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-gray-100 pb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          F
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">Fernanda Souza</span>
                            <div className="flex">
                              {[...Array(4)].map((_, i) => (
                                <span key={i} className="text-amber-500 text-xs">
                                  ★
                                </span>
                              ))}
                              <span className="text-gray-300 text-xs">★</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">Entrega super rápida e comida quentinha!</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-center py-4 text-sm text-gray-600">Mostrando 7 de 528+ avaliações</div>
                  </>
                )}
              </div>

              {!showAllReviews && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none"></div>
              )}
            </div>

            {/* See More Button */}
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="w-full py-3 text-center text-primary font-medium text-sm border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
            >
              {showAllReviews ? "Ver menos avaliações" : "Ver mais avaliações (29+)"}
            </button>
          </div>
        </div>
      </div>

      {/* Company Footer */}
      <div className="bg-gray-50 border-t border-gray-200 pb-20">
        <div className="max-w-md mx-auto px-4 py-8">
          {/* Company Info */}
          <div className="text-center mb-6">
            <img
              src="/burgl-delivery-logo-square.png"
              alt="Burgl Delivery Logo"
              className="w-16 h-16 object-contain mx-auto mb-3"
            />
            <h3 className="text-lg font-bold text-gray-900 mb-1">Burgl Delivery</h3>
            <p className="text-sm text-gray-600 mb-2">Hambúrgueres Artesanais</p>
            <p className="text-xs text-gray-500">CNPJ: 19.987.842/0001-07</p>
          </div>

          {/* Payment Certifications */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">Formas de Pagamento Aceitas</h4>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="bg-white rounded-lg p-2 shadow-sm border">
                <img src="/visa-logo-generic.png" alt="Visa" className="h-6 w-10 object-contain" />
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm border">
                <img src="/mastercard-logo.png" alt="Mastercard" className="h-6 w-10 object-contain" />
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm border">
                <img src="/american-express-logo.png" alt="American Express" className="h-6 w-10 object-contain" />
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm border">
                <img src="/pix-logo.png" alt="PIX" className="h-6 w-10 object-contain" />
              </div>
            </div>
          </div>

          {/* Trust Seals */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">Certificações e Selos</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm border text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-700">Empresa</p>
                <p className="text-xs font-medium text-gray-700">Verificada</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-700">Site</p>
                <p className="text-xs font-medium text-gray-700">Seguro</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border text-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-700">Qualidade</p>
                <p className="text-xs font-medium text-gray-700">Garantida</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-700">Higiene</p>
                <p className="text-xs font-medium text-gray-700">Certificada</p>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-center gap-6 mb-4">
              <button className="text-xs text-gray-600 hover:text-gray-800 underline">Política de Privacidade</button>
              <button className="text-xs text-gray-600 hover:text-gray-800 underline">Termos de Uso</button>
            </div>
            <p className="text-xs text-gray-500 text-center">© 2024 Burgl Delivery. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => setCurrentView("home")}
            className={`flex flex-col items-center py-2 px-4 min-w-0 ${
              currentView === "home" ? "text-primary" : "text-gray-500"
            }`}
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Início</span>
          </button>

          <button
            onClick={() => setCurrentView("search")}
            className={`flex flex-col items-center py-2 px-4 min-w-0 ${
              currentView === "search" ? "text-primary" : "text-gray-500"
            }`}
          >
            <Search className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Buscar</span>
          </button>

          <button
            onClick={() => setCurrentView("orders")}
            className={`flex flex-col items-center py-2 px-4 min-w-0 ${
              currentView === "orders" ? "text-primary" : "text-gray-500"
            }`}
          >
            <ShoppingBag className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Pedidos</span>
          </button>
        </div>
      </div>

      {/* Cart Button - Fixed position adjusted for bottom nav */}
      {newCart.length > 0 && (
        <div className="fixed bottom-24 left-4 right-4 z-30 px-4">
          <Button
            onClick={() => setShowNewCart(true)}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg py-4 flex items-center justify-center gap-3 mb-4"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium text-base">
              Ver Carrinho ({newCart.length} {newCart.length === 1 ? "item" : "itens"})
            </span>
          </Button>
        </div>
      )}

      {showApiConfig && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Configurar API IronPay</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowApiConfig(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Sistema de pagamento configurado e seguro</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setShowApiConfig(false)} className="flex-1">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showLocationPopup && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-90 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {locationStep === 1 ? (
                <>
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <img src="/burgl-delivery-logo.png" alt="Burgl Delivery" className="w-24 h-24 mx-auto mb-4" />
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        ✓ <span className="font-medium">Verificado</span>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      <span className="text-black">Com fome em </span>
                      <span className="text-red-500">{userLocationDetails.city || "sua cidade"}?</span>
                    </h2>
                    <p className="text-sm text-gray-600">
                      🔥 <strong>Entrega em 40min</strong> • Frete GRÁTIS acima de R$30 • +500 clientes satisfeitos ⭐
                    </p>
                    <p className="text-xs text-red-500 font-medium mt-2">Promoção válida hoje! 🎯</p>
                  </div>

                  <Button
                    onClick={() => setLocationStep(2)}
                    className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-medium"
                  >
                    Ver cardápio e pedir agora 🍔
                  </Button>

                  <div className="mt-8 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 text-center mb-3">Formas de pagamento aceitas:</p>
                    <div className="flex flex-wrap justify-center items-center gap-3 opacity-60">
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">PIX</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Mastercard</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Visa</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Elo</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Hipercard</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Mercado Pago</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Diners Club</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">PicPay</span>
                    </div>
                  </div>
                </>
              ) : locationStep === 2 ? (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-bold">Qual seu endereço?</h2>
                    <p className="text-sm text-gray-600 mt-1">Precisamos para calcular o tempo de entrega</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">CEP</label>
                        <Input
                          type="text"
                          value={userLocationDetails.cep}
                          onChange={handleCepChange}
                          className={`h-12 border border-gray-300 ${cepError ? "border-red-500" : ""}`}
                          placeholder="00000-000"
                          disabled={isValidatingCep}
                        />
                        {cepError && (
                          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                            <AlertCircle className="w-3 h-3" />
                            <span>{cepError}</span>
                          </div>
                        )}
                        {isValidatingCep && <div className="text-xs text-blue-600 mt-1">Validando CEP...</div>}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Número</label>
                        <Input
                          type="text"
                          value={userLocationDetails.number}
                          onChange={(e) => setUserLocationDetails((prev) => ({ ...prev, number: e.target.value }))}
                          className="h-12 border border-gray-300"
                          placeholder="Ex: 1578"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => setLocationStep(3)}
                      disabled={isValidatingCep || !userLocationDetails.cep || !userLocationDetails.number}
                      className="w-full h-12 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                    >
                      {isValidatingCep ? "Validando..." : "Continuar"}
                    </Button>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap justify-center items-center gap-2 opacity-50">
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">PIX</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Mastercard</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Visa</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Elo</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Hipercard</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Mercado Pago</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Diners Club</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">PicPay</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : locationStep === 3 ? (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-bold">Quase pronto!</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Só precisamos do seu nome e WhatsApp para confirmar o pedido
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Seu nome</label>
                        <Input
                          type="text"
                          value={customerName}
                          onChange={(e) => {
                            setCustomerName(e.target.value)
                            setNameError("")
                          }}
                          placeholder="Como você se chama?"
                          className={`h-12 border border-gray-300 ${nameError ? "border-red-500" : ""}`}
                          maxLength={50}
                        />
                        {nameError && (
                          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                            <AlertCircle className="w-3 h-3" />
                            <span>{nameError}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">WhatsApp</label>
                        <Input
                          type="tel"
                          value={whatsappNumber}
                          onChange={handleWhatsAppChange}
                          placeholder="Telefone (WhatsApp)"
                          className={`h-12 border border-gray-300 ${whatsappError ? "border-red-500" : ""}`}
                        />
                        {whatsappError && (
                          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                            <AlertCircle className="w-3 h-3" />
                            <span>{whatsappError}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleFinishWhatsAppSetup}
                      disabled={!whatsappNumber.trim() || !customerName.trim() || isAuthenticating}
                      className="w-full h-12 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                    >
                      {isAuthenticating ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Validando...
                        </div>
                      ) : (
                        "Salvar e continuar"
                      )}
                    </Button>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap justify-center items-center gap-2 opacity-50">
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">PIX</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Mastercard</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Visa</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Elo</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Hipercard</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Mercado Pago</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Diners Club</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">PicPay</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {showPhoneConfirmationPopup && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in fade-in duration-300">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tudo certo!</h2>

              <p className="text-gray-600 text-sm mb-6">
                Agora você pode fazer seus pedidos. Vamos te avisar pelo WhatsApp sobre o status da entrega.
              </p>

              <Button onClick={handleContinueToMenu} className="w-full h-12 bg-red-500 hover:bg-red-600 text-white">
                Ver cardápio
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Item Details Popup */}
      {selectedItem && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/10 z-50 flex items-end">
          <div className="bg-white w-full max-h-[90vh] overflow-y-auto rounded-t-2xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{selectedItem.name}</h2>
                <Button variant="ghost" size="sm" onClick={closeItemPopup}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Item Image and Description */}
              <div className="flex gap-4">
                <img
                  src={selectedItem.image || "/placeholder.svg"}
                  alt={selectedItem.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-800 mb-2">{selectedItem.description}</p>
                  <p className="text-lg font-bold text-gray-900">{selectedItem.price}</p>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Quantidade</span>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="font-medium text-lg w-8 text-center">{itemQuantity}</span>
                  <Button variant="outline" size="sm" onClick={() => setItemQuantity(itemQuantity + 1)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Mandatory Choices */}
              {!drinksMenuItems.some((drink) => drink.id === selectedItem?.id) &&
                !desserts.some((dessert) => dessert.id === selectedItem?.id) &&
                !initialDesserts.some((dessert) => dessert.id === selectedItem?.id) && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        Batatas (obrigatório) <span className="text-red-500">*</span>
                      </h3>
                      <div className="space-y-2">
                        {[
                          { name: "Batata Crinkle", image: "/batata-crinkle-thumbnail.jpg" },
                          { name: "Batata Rústica", image: "/batata-rustica-thumbnail.png" },
                        ].map((batata) => (
                          <label
                            key={batata.name}
                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                          >
                            <input
                              type="radio"
                              name="batata"
                              value={batata.name}
                              checked={selectedBatata === batata.name}
                              onChange={(e) => setSelectedBatata(e.target.value)}
                              className="text-red-500"
                            />
                            <img
                              src={batata.image || "/placeholder.svg"}
                              alt={batata.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                            <span className="text-sm text-gray-900">{batata.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        Refrigerantes (obrigatório) <span className="text-red-500">*</span>
                      </h3>
                      <div className="space-y-2">
                        {["Coca-Cola", "Coca-Cola sem Açúcar", "Pepsi", "Guaraná Antarctica"].map((refrigerante) => (
                          <label
                            key={refrigerante}
                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                          >
                            <input
                              type="radio"
                              name="refrigerante"
                              value={refrigerante}
                              checked={selectedRefrigerante === refrigerante}
                              onChange={(e) => setSelectedRefrigerante(e.target.value)}
                              className="text-red-500"
                            />
                            <span className="text-sm text-gray-900">{refrigerante}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              {/* Optional Extras */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Extras (opcionais)</h3>
                <div className="space-y-6">
                  {extrasCategories.map((category) => (
                    <div key={category.title}>
                      <h4 className="font-medium text-gray-800 mb-3 text-sm">{category.title}</h4>
                      <div className="space-y-2">
                        {category.items.map((extra) => (
                          <label
                            key={extra.name}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedExtras.includes(extra.name)}
                                onChange={() => toggleExtra(extra.name)}
                                className="text-red-500"
                              />
                              <span className="text-sm text-gray-900">{extra.name}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              +R$ {extra.price.toFixed(2).replace(".", ",")}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Algum comentário?</h3>
                <textarea
                  value={itemComments}
                  onChange={(e) => setItemComments(e.target.value)}
                  placeholder="Tem alguma preferência? Ex: sem cebola, carne bem passada, molho à parte"
                  maxLength={150}
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">{itemComments.length}/150</p>
              </div>

              {/* Subtotal */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Subtotal</span>
                  <span className="text-lg font-bold text-gray-900">
                    R$ {getItemSubtotal().toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>

            {/* Add Button */}
            <div className="px-4 pb-4">
              <Button
                onClick={addToNewCart}
                className="w-full h-12 text-base font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Cart Modal */}
      {showNewCart && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/10 z-50 flex items-end">
          <div className="bg-white w-full max-h-[90vh] overflow-y-auto rounded-t-2xl shadow-2xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Carrinho</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowNewCart(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Cart Items */}
              {newCart.map((cartItem) => (
                <div key={cartItem.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{cartItem.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {cartItem.batata} • {cartItem.refrigerante}
                        {cartItem.extras.length > 0 && ` • ${cartItem.extras.join(", ")}`}
                      </p>
                      {cartItem.extrasDetails && cartItem.extrasDetails.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Extras:{" "}
                          {cartItem.extrasDetails
                            .map((extra) => `${extra.name} (+R$ ${extra.price.toFixed(2).replace(".", ",")})`)
                            .join(", ")}
                        </div>
                      )}
                      {cartItem.comments && <p className="text-xs text-gray-500 mt-1 italic">"{cartItem.comments}"</p>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFromNewCart(cartItem.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateNewCartItemQuantity(cartItem.id, cartItem.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-medium w-8 text-center">{cartItem.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateNewCartItemQuantity(cartItem.id, cartItem.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      R$ {cartItem.totalPrice.toFixed(2).replace(".", ",")}
                    </div>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-red-500">
                    R$ {getNewCartTotal().toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <Button
                onClick={proceedToCheckout}
                className="w-full h-12 text-base font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                Fazer Pedido
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCheckoutFlow && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (checkoutStep === "delivery") {
                    setShowCheckoutFlow(false)
                    setShowNewCart(true)
                  } else {
                    setCheckoutStep("delivery")
                  }
                }}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>

              <div className="text-center flex-1">
                <img
                  src="/burgl-delivery-logo-square.png"
                  alt="Burgl Delivery"
                  className="w-24 h-16 object-contain rounded-lg shadow-sm mx-auto mb-2"
                />
                <h2 className="text-lg font-semibold text-gray-900">
                  {checkoutStep === "delivery" && "Finalize seu pedido"}
                  {checkoutStep === "qrcode" && "Pagamento PIX"}
                </h2>
              </div>
              <div className="w-9"></div>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {checkoutStep === "delivery" && (
              <>
                {/* Delivery Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de entrega</h3>

                  <UniversalMap className="mb-4" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Endereço:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {userLocationDetails.street && userLocationDetails.number
                          ? `${userLocationDetails.street}, ${userLocationDetails.number}`
                          : "Endereço não informado"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bairro:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {userLocationDetails.neighborhood || "Centro"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tempo estimado:</span>
                      <span className="text-sm font-medium text-gray-900">{deliveryInfo.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taxa de entrega:</span>
                      <span className="text-sm font-medium text-gray-900">{deliveryInfo.fee}</span>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do pedido</h3>
                  <div className="space-y-3">
                    {newCart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                          <div className="text-xs text-gray-600">
                            Qtd: {item.quantity} • {item.batata} • {item.refrigerante}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          R$ {item.totalPrice.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="text-red-500">R$ {getNewCartTotal().toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Forma de pagamento</h3>

                  <div className="space-y-3">
                    <button
                      onClick={handlePixPaymentClick}
                      className="w-full bg-white border-2 border-red-500 rounded-xl p-4 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <img src="/pix-logo.png" alt="PIX" className="w-8 h-8 object-contain" />
                        </div>

                        <div className="text-left flex-1">
                          <div className="text-lg font-semibold text-gray-900">Pague com Pix</div>
                          <div className="text-sm text-gray-600">Rápido e Eficiente</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={handleCreditCardPaymentClick}
                      className="w-full bg-white border-2 border-gray-300 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                          </svg>
                        </div>

                        <div className="text-left flex-1">
                          <div className="text-lg font-semibold text-gray-900">Cartão de Crédito</div>
                          <div className="text-sm text-gray-600">Visa, Mastercard, Elo e outros</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={handleMercadoPagoPaymentClick}
                      className="w-full bg-white border-2 border-gray-300 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <img src="/mercado-pago-logo.png" alt="Mercado Pago" className="w-8 h-8 object-contain" />
                        </div>

                        <div className="text-left flex-1">
                          <div className="text-lg font-semibold text-gray-900">Mercado Pago</div>
                          <div className="text-sm text-gray-600">Use o QR Code ou copie e cole o código</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={handlePixPaymentClick}
                      className="w-full bg-white border-2 border-gray-300 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <img src="/picpay-logo.png" alt="PicPay" className="w-8 h-8 object-contain" />
                        </div>

                        <div className="text-left flex-1">
                          <div className="text-lg font-semibold text-gray-900">PicPay</div>
                          <div className="text-sm text-gray-600">Use o QR Code ou copie e cole o código</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {checkoutStep === "qrcode" && (
              <>
                {/* QR Code Payment */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <img src="/pix-logo.png" alt="PIX" className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Pedido aguardando Pagamento PIX</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Escaneie o QR Code ou copie o código PIX para finalizar seu pedido
                  </p>

                  {/* QR Code */}
                  {qrCodeData && (
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4 inline-block">
                      <img src={qrCodeData || "/placeholder.svg"} alt="QR Code PIX" className="w-48 h-48 mx-auto" />
                    </div>
                  )}

                  {/* PIX Code */}
                  {pixCode && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-2">Ou copie o código PIX:</p>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs font-mono break-all">
                        {pixCode}
                      </div>
                      <Button
                        onClick={copyPixCodeToClipboard}
                        variant="outline"
                        className="mt-2 text-sm bg-transparent"
                      >
                        Copiar código PIX
                      </Button>
                    </div>
                  )}

                  {/* Timer */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Tempo restante: {formatTime(timeLeft)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">Após o pagamento, você receberá a confirmação por WhatsApp</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showDeliveryConfirmationPopup && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl animate-in fade-in duration-300">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Confirme a entrega</h2>

              {/* Delivery Time */}
              <div className="mb-6">
                <div className="text-2xl font-bold text-gray-900">Hoje</div>
                <div className="text-blue-500 text-sm">35-40 min</div>
              </div>

              {/* Delivery Address */}
              <div className="mb-6">
                <div className="text-gray-600 text-sm mb-2">Entrega em:</div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {userLocationDetails.street && userLocationDetails.number
                        ? `${userLocationDetails.street}, ${userLocationDetails.number}`
                        : "Praça da Liberdade, 244"}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {userLocationDetails.neighborhood || "Em frente à creche"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <div className="flex items-center gap-3 bg-teal-50 rounded-lg p-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img src="/pix-logo.png" alt="PIX" className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Pagamento com Pix</div>
                    <div className="text-gray-600 text-sm">QR Code ou código copia e cola</div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleConfirmDelivery}
                  className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg"
                >
                  Confirmar e fazer pedido
                </Button>

                <Button
                  onClick={() => setShowDeliveryConfirmationPopup(false)}
                  variant="ghost"
                  className="w-full h-12 text-red-500 hover:bg-red-50 font-medium"
                >
                  Alterar dados
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPixInstructionsPopup && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <img src="/pix-logo.png" alt="PIX" className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Como pagar com Pix</h2>

              <div className="text-left space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-sm text-gray-700">Abra o app do seu banco ou carteira digital</div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-sm text-gray-700">Escaneie o QR Code ou copie e cole o código Pix</div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-sm text-gray-700">Confirme o pagamento no seu app</div>
                </div>
              </div>

              <Button
                onClick={handlePixInstructionsConfirmed}
                disabled={isProcessingPix}
                className="w-full h-12 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white font-medium rounded-lg flex items-center justify-center gap-2"
              >
                {isProcessingPix && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isProcessingPix ? "Processando..." : "Ok, entendi"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showMercadoPagoInstructionsPopup && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <img src="/mercado-pago-logo.png" alt="Mercado Pago" className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Como pagar com Mercado Pago</h2>

              <div className="text-left space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-sm text-gray-700">Abra o app do Mercado Pago</div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-sm text-gray-700">Escaneie o QR Code ou copie e cole o código</div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-sm text-gray-700">Confirme o pagamento no seu app</div>
                </div>
              </div>

              <Button
                onClick={handleMercadoPagoInstructionsConfirmed}
                disabled={isProcessingPix}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-medium rounded-lg flex items-center justify-center gap-2"
              >
                {isProcessingPix && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isProcessingPix ? "Processando..." : "Ok, entendi"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCreditCardForm && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Pagamento com Cartão</h3>
                <button onClick={() => setShowCreditCardForm(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número do Cartão</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={creditCardData.cardNumber}
                    onChange={(e) => setCreditCardData({ ...creditCardData, cardNumber: e.target.value })}
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Validade</label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={creditCardData.expiryDate}
                      onChange={(e) => setCreditCardData({ ...creditCardData, expiryDate: e.target.value })}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={creditCardData.cvv}
                      onChange={(e) => setCreditCardData({ ...creditCardData, cvv: e.target.value })}
                      maxLength={4}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome no Cartão</label>
                  <input
                    type="text"
                    placeholder="Nome como está no cartão"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={creditCardData.cardholderName}
                    onChange={(e) => setCreditCardData({ ...creditCardData, cardholderName: e.target.value })}
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">R$ {getNewCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Taxa de entrega:</span>
                    <span className="font-medium text-green-600">Grátis</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold">Total do pedido:</span>
                      <span className="font-bold text-lg text-red-500">R$ {getNewCartTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={processCinqPayPayment}
                  disabled={
                    isProcessingPayment ||
                    !creditCardData.cardNumber ||
                    !creditCardData.expiryDate ||
                    !creditCardData.cvv ||
                    !creditCardData.cardholderName
                  }
                  className="w-full h-12 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg"
                >
                  {isProcessingPayment ? "Processando..." : `Pagar R$ ${getNewCartTotal().toFixed(2)}`}
                </Button>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Pagamento seguro processado pela CinqPay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

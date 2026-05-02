import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OpeningStockService } from '../../services/opening-stock.service';

@Component({
  selector: 'app-opening-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './opening-stock.component.html',
  styleUrl: './opening-stock.component.scss'
})
export class OpeningStockComponent implements OnInit {
  showModal = false;
  showFilters = false;
  isEdit = false;
  stockForm!: FormGroup;
  stocks: any[] = [];
  filteredStocks: any[] = [];
  refreshData: any = {};

  filters = {
    dt: '',
    subloc: '',
    model_no: '',
    pc: '',
    pt: '',
    sp: 0,
    text1: '',
    text2: '',
    text3: '',
    text4: ''
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private stockService: OpeningStockService
  ) { }

  viewSerialNumbers(stock: any): void {
    this.router.navigate(['/admin/opening-stock-serialnos', stock.srno]);
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.initStockForm();
      this.loadRefreshData();
      this.loadStockList();
    }
  }

  initStockForm(): void {
    const today = new Date().toISOString();
    const todayDate = today.split('T')[0];
    this.stockForm = this.fb.group({
      srno: [0],
      location: ['', Validators.required],
      sub_location: [''],
      supplier: [''],
      purchase_date: [todayDate],
      purchase_ref_no: [''],
      product_name: ['', Validators.required],
      part_name: [''],
      barcode: [''],
      model_no: [''],
      product_category: [''],
      product_type: [''],
      is_product_spare: [0],
      qty: [0],
      mfg_date: [todayDate],
      pcondition: [''],
      company: [''],
      serial_no1: [''],
      serial_no2: [''],
      mrp: [0],
      purchase_rate: [0],
      note: [''],
      product_img: [''],
      purchase_img: [''],
      product_imgBase64: [''],
      purchase_imgBase64: [''],
      created_dt: [today],
      updated_dt: [today],
      created_user_id: [0],
      updated_user_id: [0],
      bm_srno: [0],
      disID: [0],
      status: [0],
      stock: [0]
    });
  }

  loadRefreshData(): void {
    this.stockService.refresh().subscribe({
      next: (res) => {
        const data = res.data1 ? res : res;
        this.refreshData = {
          locations: (data.data2 || []).map((x: any) => x.location).filter((v: any) => v),
          sub_locations: (data.data3 || []).map((x: any) => x.sub_location).filter((v: any) => v),
          products: (data.data4 || []).map((x: any) => x.product_name).filter((v: any) => v),
          part_names: (data.data5 || []).map((x: any) => x.part_name).filter((v: any) => v),
          categories: (data.data6 || []).map((x: any) => x.product_category).filter((v: any) => v),
          types: (data.data7 || []).map((x: any) => x.product_type).filter((v: any) => v),
          companies: (data.data8 || []).map((x: any) => x.company).filter((v: any) => v),
          model_nos: (data.data9 || []).map((x: any) => x.model_no).filter((v: any) => v),
          suppliers: (data.data10 || []).map((x: any) => x.supplier).filter((v: any) => v)
        };
      },
      error: (err) => console.error('Error loading refresh data:', err)
    });
  }

    loadStockList(): void {
      //     const now = new Date();
      // const firstDay = `${now.getFullYear()}_01_01`;
      // const today = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}`;

      // const dt = this.filters.dt
      //   ? this.filters.dt.split('-').join('_')
      //   : `${firstDay}-${today}`;
      
    this.stockService.pageList({
      dt: 'NA',
      subloc: this.filters.subloc || 'NA',
      model_no: this.filters.model_no || 'NA',
      pc: this.filters.pc || 'NA',
      pt: this.filters.pt || 'NA',
      sp: this.filters.sp,
      text1: this.filters.text1 || 'NA',
      text2: this.filters.text2 || 'NA',
      text3: this.filters.text3 || 'NA',
      text4: this.filters.text4 || 'NA'
    }).subscribe({
      next: (res) => {
        const items = res?.data || res?.list || res || [];

        this.stocks = Array.isArray(items) ? items : [];

        this.filteredStocks = this.stocks
          .sort((a: any, b: any) =>
            new Date(b.created_dt || b.updated_dt || 0).getTime() -
            new Date(a.created_dt || a.updated_dt || 0).getTime()
          )
          .slice(0, 10);
      },
      error: (err) => console.error('Error loading stock list:', err)
    });
  }


  // openModal(stock?: any): void {
  //   this.isEdit = !!stock;
  //   this.selectedImages = {};
  //   this.stockForm.reset();
  //   this.initForm();
  //   if (stock) {
  //     this.stockForm.patchValue(stock);
  //   }
  //   this.showModal = true;
  // }

   openModal(stock?: any): void {
    this.isEdit = !!stock;
    this.selectedImages = {};
    this.stockForm.reset();
    this.initStockForm();
    if (stock) {
      this.stockService.getById(stock.srno).subscribe({
        next: (res) => {
          const data = res.data || res;
          this.stockForm.patchValue(data);
          this.showModal = true;
        },
        error: (err) => console.error('Error loading stock details:', err)
      });
    } else {
      this.showModal = true;
    }
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSave(): void {
    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }

    const payload = this.preparePayload();

    this.stockService.save(payload).subscribe({
      next: () => {
        this.closeModal();
        this.loadStockList();
      },
      error: (err) => console.error('Save error:', err)
    });
  }

  selectedImages: { [key: string]: boolean } = {};

  onImageSelect(event: any, field: string): void {
    const file = event.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop();
    this.stockForm.patchValue({ [field]: `.${ext}` });
    this.selectedImages[field] = true;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1] || '';
      this.stockForm.patchValue({ [`${field}Base64`]: base64 });
    };
    reader.readAsDataURL(file);
  }

  preparePayload(): any {
    const value = this.stockForm.getRawValue();

    const formatDate = (d: any) =>
      d ? new Date(d).toISOString() : new Date().toISOString();

    return Object.keys(value).reduce((payload: any, key) => {

      if (key.startsWith('ret_')) return payload;

      if (['purchase_date', 'mfg_date', 'created_dt', 'updated_dt'].includes(key)) {
        payload[key] = formatDate(value[key]);
        return payload;
      }

      if (['product_img', 'purchase_img'].includes(key)) {
        if (this.selectedImages[key]) {
          payload[key] = value[key];
          payload[`${key}Base64`] = value[`${key}Base64`];
        }
        return payload;
      }

      payload[key] = value[key];
      return payload;

    }, {});
  }

  applyFilters(): void {
    this.loadStockList();
  }

  resetFilters(): void {
    this.filters = {
      dt: '', subloc: '', model_no: '', pc: '', pt: '',
      sp: 0, text1: '', text2: '', text3: '', text4: ''
    };
    this.loadStockList();
  }
}

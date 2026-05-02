import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OpeningStockSerialnosService } from '../../services/opening-stock-serialnos.service';
import { OpeningStockService } from '../../services/opening-stock.service';

@Component({
  selector: 'app-opening-stock-serialnos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './opening-stock-serialnos.component.html',
  styleUrl: './opening-stock-serialnos.component.scss'
})
export class OpeningStockSerialnosComponent implements OnInit {
  showModal = false;
  isEdit = false;
  serialForm!: FormGroup;
  serials: any[] = [];
  filteredSerials: any[] = [];
  selectedImages: { [key: string]: boolean } = {};
  parentSrno = 0;
  refreshData: any = {};
  statusList: any[] = [];

  filters = {
    text1: '',
    text2: '',
    searchString: ''
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private serialService: OpeningStockSerialnosService,
    private stockService: OpeningStockService
  ) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.parentSrno = Number(this.route.snapshot.paramMap.get('osSrno')) || 0;
      this.initForm();
      this.loadRefreshData();
      this.loadSerials();
    }
  }

  initForm(): void {
    const today = new Date().toISOString();
    this.serialForm = this.fb.group({
      srno: [0],
      os_srno: [this.parentSrno, Validators.required],
      serial_no1: ['', Validators.required],
      serial_no2: [''],
      serial_img: [''],
      serial_imgBase64: [''],
      qty: [1],
      status: [0],
      created_dt: [today],
      updated_dt: [today],
      created_user_id: [0],
      updated_user_id: [0],
      bm_srno: [0],
      disID: [0]
    });
  }

  loadRefreshData(): void {
    this.stockService.refresh().subscribe({
      next: (res) => {
        const data = res.data1 ? res : res;
        const statusData = data.data1 || data.statusList || [];
        this.statusList = statusData.map((x: any) => ({ id: x.status || x.srno || x.id, name: x.statusName || x.status_name || x.name || x.status || 'Unknown' }));
      },
      error: (err) => console.error('Error loading refresh data:', err)
    });
  }

  loadSerials(): void {
    this.filters.text1 = this.parentSrno.toString();

    this.serialService.pageList({
      text1: this.filters.text1,
      text2: this.filters.text2 || '',
      searchString: this.filters.searchString || ''
    }).subscribe({
      next: (res) => {
        const items = res.data || res.list || res || [];
        this.serials = Array.isArray(items) ? items : (items.data || []);
        this.filteredSerials = [...this.serials].sort((a: any, b: any) => {
          const dateA = new Date(a.created_dt || a.updated_dt || 0).getTime();
          const dateB = new Date(b.created_dt || b.updated_dt || 0).getTime();
          return dateB - dateA;
        });
      },
      error: (err) => console.error('Error loading serials:', err)
    });
  }

  openModal(serial?: any): void {
    this.isEdit = !!serial;
    this.selectedImages = {};
    this.serialForm.reset();
    this.initForm();
    if (serial) {
      this.serialService.getById(serial.srno).subscribe({
        next: (res) => {
          const data = res.data || res;
          this.serialForm.patchValue(data);
          this.showModal = true;
        },
        error: (err) => console.error('Error loading serial details:', err)
      });
    } else {
      this.showModal = true;
    }
  }

  closeModal(): void {
    this.showModal = false;
  }

  onImageSelect(event: any, field: string): void {
    const file = event.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop();
    this.serialForm.patchValue({ [field]: `.${ext}` });
    this.selectedImages[field] = true;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1] || '';
      this.serialForm.patchValue({ [`${field}Base64`]: base64 });
    };
    reader.readAsDataURL(file);
  }

  onSave(): void {
    if (this.serialForm.invalid) {
      this.serialForm.markAllAsTouched();
      return;
    }

    const payload = this.preparePayload();

    this.serialService.save(payload).subscribe({
      next: () => {
        this.closeModal();
        this.loadSerials();
      },
      error: (err) => console.error('Save error:', err)
    });
  }

  preparePayload(): any {
    const value = this.serialForm.getRawValue();

    const formatDate = (d: any) => {
      if (!d || d === '' || d === null || d === undefined) {
        return new Date().toISOString();
      }
      try {
        const date = new Date(d);
        if (isNaN(date.getTime())) {
          return new Date().toISOString();
        }
        return date.toISOString();
      } catch {
        return new Date().toISOString();
      }
    };

    value.created_dt = formatDate(value.created_dt);
    value.updated_dt = formatDate(value.updated_dt);

    const payload = { ...value };

    if (!this.selectedImages['serial_img']) {
      delete payload.serial_img;
      delete payload.serial_imgBase64;
    }

    Object.keys(payload).forEach(key => {
      if (key.startsWith('ret_')) {
        delete (payload as any)[key];
      }
    });

    return payload;
  }

  applyFilters(): void {
    this.loadSerials();
  }

  resetFilters(): void {
    this.filters = { text1: '', text2: '', searchString: '' };
    this.loadSerials();
  }

  goBack(): void {
    this.router.navigate(['/admin/opening-stock']);
  }
}

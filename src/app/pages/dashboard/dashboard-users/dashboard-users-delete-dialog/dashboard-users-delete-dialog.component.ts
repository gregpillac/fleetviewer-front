import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
    standalone: true,
    selector: 'app-dashboard-users-delete-dialog',
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIcon],
    templateUrl: './dashboard-users-delete-dialog.component.html',
    styleUrl: './dashboard-users-delete-dialog.component.scss'
})
export class DashboardUsersDeleteDialogComponent implements OnInit {
    hasAccount = false;
    fullName = '';

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { person: any, user: any | null },
        private ref: MatDialogRef<DashboardUsersDeleteDialogComponent>
    ) {}

    ngOnInit() {
        this.hasAccount = !!this.data.user;
        const p = this.data.person;
        this.fullName = `${p?.firstName ?? ''} ${p?.lastName ?? ''}`.trim();
    }

    choose(choice: 'account' | 'person') {
        this.ref.close(choice);
    }

    close() {
        this.ref.close();
    }
}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CoreModule } from './core/core.module';
import { ErrorBoundaryComponent } from './shared/components/error-boundary/error-boundary.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CoreModule, ErrorBoundaryComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'External Mines Programmator';
}

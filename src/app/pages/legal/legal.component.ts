import { Component, OnDestroy } from '@angular/core';
import {ActivatedRoute, ParamMap, RouterLink, RouterLinkActive} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml, Title, Meta } from '@angular/platform-browser';
import { Subscription, switchMap, map } from 'rxjs';

type LegalSlug = 'cgv' | 'cgu' | 'mentions-legales' | 'confidentialite';

@Component({
    selector: 'app-legal',
    templateUrl: './legal.component.html',
    styleUrls: ['./legal.component.scss'],
    imports: [
        RouterLink,
        RouterLinkActive
    ]
})
export class LegalComponent implements OnDestroy {
    html: SafeHtml | null = null;
    currentSlug: LegalSlug | null = null;

    private sub?: Subscription;

    // mapping slug -> fichier + titres SEO
    private readonly MAP: Record<LegalSlug, { file: string; title: string; desc: string }> = {
        cgv: {
            file: '/_static/legal/cgv.html',
            title: 'Conditions Générales de Vente (CGV)',
            desc: 'Conditions générales de vente applicables aux commandes et abonnements.',
        },
        cgu: {
            file: '/_static/legal/cgu.html',
            title: 'Conditions Générales d’Utilisation (CGU)',
            desc: 'Règles d’utilisation de la plateforme et obligations des utilisateurs.',
        },
        'mentions-legales': {
            file: '/_static/legal/mentions-legales.html',
            title: 'Mentions légales',
            desc: 'Informations légales de l’éditeur et de l’hébergeur du site.',
        },
        confidentialite: {
            file: '/_static/legal/confidentialite.html',
            title: 'Politique de confidentialité',
            desc: 'Informations sur la collecte et le traitement des données personnelles (RGPD).',
        },
    };

    constructor(
        private route: ActivatedRoute,
        private http: HttpClient,
        private sanitizer: DomSanitizer,
        private title: Title,
        private meta: Meta
    ) {
        this.sub = this.route.paramMap
            .pipe(
                map((params: ParamMap) => params.get('slug') as LegalSlug | null),
                switchMap((slug) => {
                    this.html = null;
                    this.currentSlug = slug;
                    const conf = this.MAP[slug as LegalSlug];
                    this.title.setTitle(`FleetViewer - ${conf.title}`); // Gestion du titre de la page
                    this.meta.updateTag({ name: 'description', content: conf.desc });

                    return this.http.get(conf.file, { responseType: 'text' });
                })
            )
            .subscribe({
                next: (content) => (this.html = this.sanitizer.bypassSecurityTrustHtml(content)),
                error: () => {
                    this.html = this.sanitizer.bypassSecurityTrustHtml(
                        '<h1>Contenu indisponible</h1><p>Veuillez réessayer plus tard ou <a href="mailto:contact@neosolix.com">nous contacter</a>.</p>'
                    );
                },
            });
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }
}

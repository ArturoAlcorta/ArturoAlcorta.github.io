/*
 * Shared site chrome for arturoalcorta.github.io
 *
 * Loaded on every page immediately after the Tailwind CDN. It owns the three
 * things that used to be copy-pasted into each file (and quietly drifted apart):
 * the Tailwind theme, the <nav>, and the <footer>.
 *
 * Pages opt in by leaving two empty containers in the markup:
 *     <div data-site-nav></div>  ...  <div data-site-footer></div>
 *
 * Per-page <title>, <meta name="description"> and the Open Graph tags stay in
 * each page's own <head> on purpose: link-preview crawlers (LinkedIn, Slack,
 * WhatsApp) do not run JavaScript, so anything injected from here would be
 * invisible to them.
 */

/* --- Tailwind theme ---------------------------------------------------- */

tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#3b82f6', // Un azul estándar
                dark: '#0f172a',    // Fondo muy oscuro (Slate-900)
                card: '#1e293b',    // Fondo de tarjetas (Slate-800)
                cyan: '#06b6d4',    // Para seccion de articulos publicados
                purple: '#8b5cf6',  // Para seccion de proyectos personales
            }
        }
    }
};

/* --- Nav --------------------------------------------------------------- */

(function () {
    'use strict';

    // The browser's own `[hidden] { display: none }` lives in the UA stylesheet,
    // so any Tailwind display utility on the same element (the mobile panel is a
    // `flex` column) beats it and the panel renders open. Re-assert it from an
    // author stylesheet so `el.hidden` is actually authoritative.
    var reset = document.createElement('style');
    reset.textContent = '[hidden]{display:none!important}';
    document.head.appendChild(reset);

    var path = window.location.pathname.replace(/index\.html$/, '');
    var onHome = path === '/' || path === '';

    // On the home page the two sections live on the page itself, so the nav
    // scrolls to them; everywhere else it navigates.
    var LINKS = [
        { label: 'Projects',          href: onHome ? '#proyectos' : '/projects', color: 'purple', match: '/projects' },
        { label: 'Published Articles', href: onHome ? '#articles'  : '/articles', color: 'cyan',   match: '/articles' }
    ];

    function isCurrent(link) {
        return !onHome && path.indexOf(link.match) === 0;
    }

    function linkMarkup(link, extraClasses) {
        var current = isCurrent(link);
        return '<a href="' + link.href + '"' +
               (current ? ' aria-current="page"' : '') +
               ' class="hover:text-' + link.color + ' transition ' +
               (current ? 'text-' + link.color + ' ' : '') +
               (extraClasses || '') + '">' + link.label + '</a>';
    }

    function navMarkup() {
        return '' +
        '<nav class="max-w-5xl mx-auto p-6">' +
            '<div class="flex justify-between items-center">' +
                '<div class="text-2xl font-bold text-white tracking-wider">' +
                    '<a href="/" class="group">' +
                        '<span class="group-hover:text-primary transition">AA<span class="text-primary">.dev</span></span>' +
                    '</a>' +
                '</div>' +

                // Desktop links
                '<div class="space-x-6 hidden md:block">' +
                    LINKS.map(function (l) { return linkMarkup(l); }).join('') +
                '</div>' +

                // Mobile toggle
                '<button type="button" data-nav-toggle aria-expanded="false" aria-controls="site-nav-mobile" aria-label="Open menu" ' +
                    'class="md:hidden p-2 -mr-2 text-gray-400 hover:text-white transition">' +
                    '<svg data-nav-icon="open" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />' +
                    '</svg>' +
                    '<svg data-nav-icon="close" hidden xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />' +
                    '</svg>' +
                '</button>' +
            '</div>' +

            // Mobile panel
            '<div id="site-nav-mobile" hidden class="md:hidden mt-4 pt-4 border-t border-gray-800 flex flex-col gap-3">' +
                LINKS.map(function (l) { return linkMarkup(l, 'py-1'); }).join('') +
            '</div>' +
        '</nav>';
    }

    function footerMarkup() {
        return '' +
        '<footer class="border-t border-gray-800 py-10 text-center text-gray-500 text-sm">' +
            '<p>&copy; Arturo Alcorta</p>' +
        '</footer>';
    }

    function wireMobileNav(root) {
        var toggle = root.querySelector('[data-nav-toggle]');
        var panel = root.querySelector('#site-nav-mobile');
        if (!toggle || !panel) return;

        var iconOpen = toggle.querySelector('[data-nav-icon="open"]');
        var iconClose = toggle.querySelector('[data-nav-icon="close"]');

        // Set the attribute rather than the `hidden` property: the property is
        // defined on HTMLElement only, so assigning it on an <svg> silently
        // creates a plain JS expando and never reaches the DOM.
        function setHidden(el, hide) {
            if (hide) el.setAttribute('hidden', '');
            else el.removeAttribute('hidden');
        }

        function setOpen(open) {
            setHidden(panel, !open);
            setHidden(iconOpen, open);
            setHidden(iconClose, !open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        }

        toggle.addEventListener('click', function () {
            setOpen(panel.hasAttribute('hidden'));
        });

        // Tapping a link closes the panel — matters for the home page, where the
        // links are in-page anchors and no navigation happens.
        panel.addEventListener('click', function (event) {
            if (event.target.closest('a')) setOpen(false);
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth >= 768) setOpen(false);
        });
    }

    function render() {
        var navHost = document.querySelector('[data-site-nav]');
        if (navHost) {
            navHost.outerHTML = navMarkup();
            wireMobileNav(document);
        }

        var footerHost = document.querySelector('[data-site-footer]');
        if (footerHost) {
            // Pages carry their own bottom spacing, so keep whatever margin the
            // placeholder declared.
            var margin = footerHost.className;
            footerHost.outerHTML = footerMarkup().replace(
                'border-t border-gray-800',
                'border-t border-gray-800 ' + margin
            );
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }
})();

// البحث الداخلي
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const val = searchInput.value.trim().toLowerCase();
        if (!val) {
            document.querySelectorAll('.item, .card').forEach(el => el.classList.remove('hidden'));
            return;
        }
        document.querySelectorAll('.item, .card').forEach(el => {
            const text = el.textContent.toLowerCase();
            if (text.includes(val)) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });
    });
}
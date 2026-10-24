import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Search, ShieldCheck, ArrowLeft, ExternalLink, Save } from 'lucide-react';
import { BookCoverPicker } from '@/components/admin/BookCoverPicker';
import { library } from '@/services';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Field, inputCls } from '@/components/forms/AuthShell';
import { ErrorState } from '@/components/shared/states';
import { BookCover } from '@/components/books/BookCover';
import type { AppRole, BookEdit, Member } from '@/types/library';

export function ManagementTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-extrabold">{title}</h1>{action}</div>;
}
export function Catalogue() {
  const [q, setQ] = useState('');
  const books = useQuery({ queryKey: ['books', { q }], queryFn: () => library.listBooks({ q }) });
  return <><ManagementTitle title="Catalogue" action={<Button asChild><Link to="/admin/books/add"><Plus /> Add book</Link></Button>} />
    <label className="mb-6 flex max-w-lg items-center gap-3"><Search className="size-5 text-muted-foreground"/><input aria-label="Search books" className={inputCls} placeholder="Title, author or ISBN" value={q} onChange={e => setQ(e.target.value)}/></label>
    {books.error ? <ErrorState message={books.error.message}/> : books.isPending ? <p>Loading books…</p> : <div className="divide-y border-y">{books.data.map(b => <div key={b.id} className="flex items-center gap-4 py-4"><div className="w-12 shrink-0"><BookCover src={b.coverUrl} title={b.title} bookId={b.id}/></div><div className="min-w-0 flex-1"><p className="font-bold">{b.title}</p><p className="text-sm text-muted-foreground">{b.authors.join(', ')} · {b.isbn}</p><p className="text-xs text-muted-foreground">{b.availableCopies} / {b.totalCopies} available</p></div><Button variant="soft" size="sm" asChild><Link to="/admin/books/$id" params={{ id: b.id }}><Pencil className="size-4"/> Edit</Link></Button></div>)}{!books.data.length && <p className="py-8 text-muted-foreground">No matching books.</p>}</div>}
  </>;
}
const empty: BookEdit = { coverUrl: null, title: '', isbn: '', authors: [], publisher: '', department: '', language: 'English', publicationYear: '', description: '', categoryId: '', featured: false };
export function BookEditor({ id }: { id?: string }) {
  const book = useQuery({ queryKey: ['book', id], queryFn: () => id ? library.getBook(id) : null, enabled: !!id });
  if (id && book.isPending) return <p>Loading book…</p>;
  if (id && (book.error || !book.data)) return <ErrorState message={book.error?.message ?? 'Book not found'}/>;
  const b = book.data;
  return <EditorForm key={id ?? 'new'} initial={b ? { id: b.id, coverUrl: b.coverUrl, title: b.title, isbn: b.isbn, authors: b.authors, publisher: b.publisher ?? '', department: b.department ?? '', language: b.language, publicationYear: String(b.publicationYear ?? ''), description: b.description ?? '', categoryId: b.category?.id ?? '', featured: b.featured } : empty}/>;
}
function EditorForm({ initial }: { initial: BookEdit }) {
  const [v, setV] = useState(initial);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const [id, setId] = useState(initial.id);
  const [authors, setAuthors] = useState(initial.authors.join(', '));
  const [barcode, setBarcode] = useState(''); const [shelf, setShelf] = useState('');
  const qc = useQueryClient();
  const categories = useQuery({ queryKey: ['categories'], queryFn: () => library.listCategories() });
  const copies = useQuery({ queryKey: ['copies', id], queryFn: () => id ? library.listCopies(id) : [], enabled: !!id });
  const save = useMutation({ mutationFn: async () => {
    let coverUrl = v.coverUrl;
    if (coverFile) {
      coverUrl = await library.uploadBookCover(coverFile);
      setV(current => ({ ...current, coverUrl }));
      setCoverFile(null);
    }
    return library.saveBook({ ...v, coverUrl, id, authors: authors.split(',').map(a => a.trim()).filter(Boolean) });
  }, onSuccess: bid => { setId(bid); toast.success('Book saved'); qc.invalidateQueries({ queryKey: ['books'] }); qc.invalidateQueries({ queryKey: ['book'] }); if (!initial.id) navigate({ to: '/admin/books/$id', params: { id: bid }, replace: true }); }, onError: e => toast.error(e.message) });
  const add = useMutation({ mutationFn: () => { if (!id) throw new Error('Save the book first'); return library.addCopy(id, barcode, shelf); }, onSuccess: () => { setBarcode(''); toast.success('Copy added'); qc.invalidateQueries(); }, onError: e => toast.error(e.message) });
  const field = (key: 'title'|'isbn'|'publisher'|'department'|'language'|'publicationYear', label: string, required = false) => <Field id={key} label={label}><input id={key} required={required} className={inputCls} value={v[key]} onChange={e => setV({ ...v, [key]: e.target.value })}/></Field>;
  return <><Button asChild variant="ghost" size="sm" className="mb-5"><Link to="/admin/books"><ArrowLeft />Catalogue</Link></Button><ManagementTitle title={initial.id ? 'Edit book' : 'Add book'} action={initial.id ? <Button asChild variant="outline"><Link to="/books/$id" params={{ id: initial.id }}><ExternalLink />View in library</Link></Button> : undefined}/><form onSubmit={e => { e.preventDefault(); save.mutate(); }} className="max-w-3xl space-y-5"><fieldset disabled={save.isPending} className="min-w-0 space-y-5">
    <BookCoverPicker value={v.coverUrl ?? null} file={coverFile} title={v.title} disabled={save.isPending} onChange={(file, remove) => { setCoverFile(file); if (remove) setV(current => ({ ...current, coverUrl: null })); }} />
    <div className="grid gap-4 sm:grid-cols-2">{field('title','Title',true)}{field('isbn','ISBN',true)}</div>
    <Field id="authors" label="Authors"><input id="authors" className={inputCls} value={authors} onChange={e => setAuthors(e.target.value)}/></Field>
    <div className="grid gap-4 sm:grid-cols-2">{field('publisher','Publisher')}{field('department','Department')}{field('language','Language')}{field('publicationYear','Publication year')}</div>
    <Field id="category" label="Category"><select id="category" className={inputCls} value={v.categoryId} onChange={e => setV({...v,categoryId:e.target.value})}><option value="">Uncategorized</option>{categories.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
    <Field id="description" label="Description"><textarea id="description" className={`${inputCls} h-32 py-3`} value={v.description} onChange={e => setV({...v,description:e.target.value})}/></Field>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.featured} onChange={e => setV({...v,featured:e.target.checked})}/> Featured book</label>
    <div className="flex flex-wrap gap-3 border-t pt-5"><Button disabled={save.isPending}><Save />{save.isPending ? 'Saving…' : 'Save book'}</Button><Button asChild variant="ghost"><Link to="/admin/books">Cancel</Link></Button></div></fieldset>
  </form>{id && <section className="mt-12 max-w-3xl border-t pt-8"><h2 className="mb-4 text-xl font-bold">Physical copies</h2>{copies.error && <ErrorState message={copies.error.message}/>}<ul className="divide-y">{copies.data?.map(c => <li key={c.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><b>{c.barcode}</b><span>{c.shelf_location ?? 'No shelf'} · {c.status}</span></li>)}</ul><form className="mt-4 flex flex-wrap gap-3" onSubmit={e => { e.preventDefault(); add.mutate(); }}><input aria-label="New barcode" required className={`${inputCls} flex-1`} placeholder="Unique barcode" value={barcode} onChange={e => setBarcode(e.target.value)}/><input aria-label="Shelf location" className={`${inputCls} flex-1`} placeholder="Shelf location" value={shelf} onChange={e => setShelf(e.target.value)}/><Button disabled={add.isPending}><Plus/>Add copy</Button></form></section>}</>;
}
export function Members({ owner = false }: { owner?: boolean }) {
  const [q,setQ] = useState(''); const members = useQuery({queryKey:['management-members'],queryFn:()=>library.managementMembers()});
  return <><ManagementTitle title={owner ? 'Access management' : 'Members'}/><input aria-label="Search members" className={`${inputCls} mb-6 max-w-lg`} placeholder="Name or email" value={q} onChange={e=>setQ(e.target.value)}/>{members.error ? <ErrorState message={members.error.message}/> : members.isPending ? <p>Loading members…</p> : <div className="divide-y border-y">{members.data.filter(m => `${m.name} ${m.email}`.toLowerCase().includes(q.toLowerCase())).map(m=><MemberRow key={m.id} member={m} owner={owner}/>)}</div>}</>;
}
function MemberRow({ member, owner }: { member: Member; owner: boolean }) {
  const { user } = useAuth(); const qc = useQueryClient(); const [role,setRole]=useState<AppRole>(member.roles[0] ?? 'student');
  const change=useMutation({mutationFn:()=>library.setMemberRole(member.id,role),onSuccess:()=>{toast.success('Access updated');qc.invalidateQueries();},onError:e=>toast.error(e.message)});
  return <div className="flex flex-wrap items-center justify-between gap-4 py-5"><div className="min-w-0"><p className="font-bold">{member.name || 'Unnamed member'}</p><p className="break-all text-sm text-muted-foreground">{member.email}</p><p className="mt-1 text-xs text-primary">{member.roles.join(', ').replaceAll('_',' ')}</p></div>{owner && user?.id !== member.id && <div className="flex flex-wrap gap-2"><select aria-label={`Role for ${member.email}`} className="h-10 rounded-md border bg-card px-3 text-sm" value={role} onChange={e=>setRole(e.target.value as AppRole)}>{(['student','faculty','librarian','admin','super_admin'] as AppRole[]).map(r=><option key={r} value={r}>{r.replace('_',' ')}</option>)}</select><Button variant="soft" disabled={change.isPending || member.roles.length===1 && role===member.roles[0]} onClick={()=>{if(window.confirm(`Change ${member.name || member.email}'s role to ${role.replace('_',' ')}?`))change.mutate();}}><ShieldCheck/>Update access</Button></div>}</div>;
}
export function Taxonomy({ kind }: { kind: 'authors'|'categories' }) {
  const [name,setName]=useState(''); const [slug,setSlug]=useState(''); const qc=useQueryClient();
  const rows=useQuery({queryKey:['management-taxonomy',kind],queryFn:async()=>kind==='authors' ? await library.listAuthors() : (await library.listCategories()).map(c=>c.name)});
  const save=useMutation({mutationFn:()=>kind==='authors'?library.saveAuthor(name):library.saveCategory(name,slug),onSuccess:()=>{setName('');setSlug('');toast.success('Saved');qc.invalidateQueries();},onError:e=>toast.error(e.message)});
  return <><ManagementTitle title={kind==='authors'?'Authors':'Categories'}/><form className="mb-8 flex flex-wrap gap-3" onSubmit={e=>{e.preventDefault();save.mutate();}}><input aria-label="Name" required className={`${inputCls} max-w-sm`} placeholder="Name" value={name} onChange={e=>setName(e.target.value)}/>{kind==='categories'&&<input aria-label="Category slug" required pattern="[a-z0-9-]+" className={`${inputCls} max-w-sm`} placeholder="category-slug" value={slug} onChange={e=>setSlug(e.target.value)}/>}<Button disabled={save.isPending}><Plus/>Add</Button></form>{rows.error?<ErrorState message={rows.error.message}/>:<ul className="divide-y border-y">{rows.data?.map((n,i)=><li key={`${n}-${i}`} className="py-4 font-medium">{n}</li>)}</ul>}</>;
}
export function AuditHistory() {
  const audit=useQuery({queryKey:['admin-audit'],queryFn:()=>library.auditLog()});
  return <section className="mt-12 border-t pt-8"><h2 className="mb-5 text-xl font-bold">Recent audit history</h2>{audit.error?<ErrorState message={audit.error.message}/>:audit.isPending?<p>Loading history…</p>:<ul className="divide-y">{audit.data.map(a=><li key={a.id} className="flex flex-wrap justify-between gap-3 py-4 text-sm"><div><b>{a.action} · {a.entity.replaceAll('_',' ')}</b><p className="break-all text-xs text-muted-foreground">Actor: {a.actor_id}</p></div><span className="text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span></li>)}{!audit.data.length&&<p className="py-5 text-muted-foreground">No recorded changes yet.</p>}</ul>}</section>;
}
